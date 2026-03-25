/**
 * Application principale - Adapte Recette
 */

(function() {
    'use strict';

    // State
    let ingredients = [];
    let originalPortions = 4;

    // DOM Elements
    const elements = {
        // Tabs
        tabs: document.querySelectorAll('.tab'),
        tabPanels: document.querySelectorAll('.tab-panel'),

        // URL tab
        urlInput: document.getElementById('url-input'),
        fetchBtn: document.getElementById('fetch-btn'),

        // Description tab
        descriptionInput: document.getElementById('description-input'),
        extractBtn: document.getElementById('extract-btn'),

        // Manual tab
        manualForm: document.querySelector('.manual-form'),
        addIngredientBtn: document.getElementById('add-ingredient-btn'),

        // Ingredients section
        ingredientsSection: document.getElementById('ingredients-section'),
        ingredientsList: document.getElementById('ingredients-list'),
        portionsOriginal: document.getElementById('portions-original'),
        portionsOriginalGroup: document.getElementById('portions-original-group'),
        clearIngredientsBtn: document.getElementById('clear-ingredients-btn'),

        // Calculation section
        calculationSection: document.getElementById('calculation-section'),
        calcModeRadios: document.querySelectorAll('input[name="calc-mode"]'),
        portionsRow: document.querySelector('.portions-row'),
        multiplierInputGroup: document.getElementById('multiplier-input-group'),
        portionsTarget: document.getElementById('portions-target'),
        multiplier: document.getElementById('multiplier'),
        quickMultipliers: document.querySelectorAll('.btn-chip[data-multiplier]'),

        // Result section
        resultSection: document.getElementById('result-section'),
        resultPortions: document.getElementById('result-portions'),
        resultList: document.getElementById('result-list'),
        copyResultBtn: document.getElementById('copy-result-btn'),

        // Collapsible ingredients
        ingredientsToggle: document.getElementById('ingredients-toggle'),
        ingredientsContent: document.getElementById('ingredients-content'),
        ingredientCount: document.querySelector('.ingredient-count'),

        // Utilities
        loadingOverlay: document.getElementById('loading-overlay'),
        toastContainer: document.getElementById('toast-container')
    };

    // ==================== UTILITIES ====================

    function showLoading() {
        elements.loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        elements.loadingOverlay.style.display = 'none';
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '';

        // Arrondir a 2 decimales
        const rounded = Math.round(num * 100) / 100;

        // Si c'est un entier, ne pas afficher de decimales
        if (rounded === Math.floor(rounded)) {
            return rounded.toString();
        }

        // Afficher avec virgule (format francais)
        return rounded.toString().replace('.', ',');
    }

    // ==================== TABS ====================

    function initTabs() {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = `tab-${tab.dataset.tab}`;

                // Update tabs
                elements.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update panels
                elements.tabPanels.forEach(panel => {
                    panel.classList.toggle('active', panel.id === targetId);
                });
            });
        });
    }

    // ==================== URL FETCH ====================

    async function fetchFromUrl() {
        const url = elements.urlInput.value.trim();

        if (!url) {
            showToast('Veuillez entrer une URL', 'error');
            return;
        }

        // Validate URL
        if (!url.match(/^https?:\/\//)) {
            showToast('URL invalide', 'error');
            return;
        }

        // Check if it's Instagram or TikTok
        if (!url.includes('instagram.com') && !url.includes('tiktok.com')) {
            showToast('Seuls Instagram et TikTok sont supportes', 'error');
            return;
        }

        showLoading();

        try {
            const response = await fetch('/api/fetch-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.description) {
                // Parse the description
                const parsed = IngredientParser.parse(data.description);
                const portions = IngredientParser.detectPortions(data.description);

                if (parsed.length > 0) {
                    setIngredients(parsed, portions);
                    showToast(`${parsed.length} ingredient(s) trouve(s)`, 'success');
                } else {
                    // Fallback to description tab with the text
                    switchToDescriptionTab(data.description);
                    showToast('Description recuperee. Verifiez les ingredients.', 'info');
                }
            } else if (data.fallback || data.error) {
                // API failed, switch to description tab
                switchToDescriptionTab('');
                showToast(data.error || 'Copiez-collez la description manuellement', 'error');
            } else {
                throw new Error('Aucune description trouvee');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            switchToDescriptionTab('');
            showToast('Erreur reseau. Collez la description manuellement.', 'error');
        } finally {
            hideLoading();
        }
    }

    function switchToDescriptionTab(text = '') {
        elements.descriptionInput.value = text;
        // Switch to description tab
        elements.tabs.forEach(t => t.classList.remove('active'));
        elements.tabPanels.forEach(p => p.classList.remove('active'));
        elements.tabs[1].classList.add('active');
        document.getElementById('tab-description').classList.add('active');
        elements.descriptionInput.focus();
    }

    // ==================== DESCRIPTION PARSING ====================

    function extractFromDescription() {
        const text = elements.descriptionInput.value.trim();

        if (!text) {
            showToast('Veuillez coller une description', 'error');
            return;
        }

        const parsed = IngredientParser.parse(text);
        const portions = IngredientParser.detectPortions(text);

        if (parsed.length > 0) {
            setIngredients(parsed, portions);
            showToast(`${parsed.length} ingredient(s) extrait(s)`, 'success');
        } else {
            showToast('Aucun ingredient detecte dans le texte', 'error');
        }
    }

    // ==================== MANUAL INPUT ====================

    function createManualRow(ingredient = null) {
        const row = document.createElement('div');
        row.className = 'manual-row';
        row.innerHTML = `
            <input type="number" class="ingredient-qty" placeholder="Qte" step="any" value="${ingredient?.quantity || ''}">
            <input type="text" class="ingredient-unit" placeholder="Unite" value="${ingredient?.unit || ''}">
            <input type="text" class="ingredient-name" placeholder="Ingredient" value="${ingredient?.name || ''}">
            <button class="btn-icon btn-remove" title="Supprimer">&times;</button>
        `;

        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
            updateFromManualForm();
        });

        // Update on input change
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', updateFromManualForm);
        });

        return row;
    }

    function addManualIngredient() {
        const row = createManualRow();
        elements.manualForm.appendChild(row);
        row.querySelector('.ingredient-qty').focus();
    }

    function updateFromManualForm() {
        const rows = elements.manualForm.querySelectorAll('.manual-row');
        const newIngredients = [];

        rows.forEach(row => {
            const name = row.querySelector('.ingredient-name').value.trim();
            const qty = row.querySelector('.ingredient-qty').value;
            const unit = row.querySelector('.ingredient-unit').value.trim();

            if (name) {
                newIngredients.push({
                    name: name,
                    quantity: qty ? parseFloat(qty) : null,
                    unit: unit
                });
            }
        });

        if (newIngredients.length > 0) {
            setIngredients(newIngredients);
        }
    }

    // ==================== INGREDIENTS MANAGEMENT ====================

    function setIngredients(newIngredients, portions = null) {
        ingredients = newIngredients;

        if (portions !== null) {
            // Portions detectees dans le texte
            originalPortions = portions;
            elements.portionsOriginal.value = portions;
            elements.portionsTarget.value = portions;
            elements.portionsOriginalGroup.classList.remove('needs-check');
            elements.portionsOriginalGroup.classList.add('confirmed');
        } else {
            // Portions non detectees - afficher l'indicateur
            elements.portionsOriginalGroup.classList.add('needs-check');
            elements.portionsOriginalGroup.classList.remove('confirmed');
        }

        renderIngredients();
        showSections();
        updateResults();

        // Update ingredient count
        elements.ingredientCount.textContent = `(${ingredients.length})`;

        // Collapse ingredients section by default and scroll to calculator
        elements.ingredientsSection.classList.add('collapsed');

        // Auto-scroll to calculation section after a short delay
        setTimeout(() => {
            elements.calculationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function renderIngredients() {
        elements.ingredientsList.innerHTML = '';

        ingredients.forEach((ing, index) => {
            const item = document.createElement('div');
            item.className = 'ingredient-item';
            item.innerHTML = `
                <input type="number" value="${ing.quantity || ''}" step="any" data-index="${index}" data-field="quantity">
                <input type="text" value="${ing.unit || ''}" data-index="${index}" data-field="unit">
                <input type="text" value="${ing.name}" data-index="${index}" data-field="name">
                <button class="btn-icon btn-remove" data-index="${index}" title="Supprimer">&times;</button>
            `;
            elements.ingredientsList.appendChild(item);
        });

        // Add event listeners
        elements.ingredientsList.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;

                if (field === 'quantity') {
                    ingredients[index][field] = e.target.value ? parseFloat(e.target.value) : null;
                } else {
                    ingredients[index][field] = e.target.value;
                }

                updateResults();
            });
        });

        elements.ingredientsList.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                ingredients.splice(index, 1);
                renderIngredients();
                updateResults();

                if (ingredients.length === 0) {
                    hideSections();
                }
            });
        });
    }

    function showSections() {
        elements.ingredientsSection.style.display = 'block';
        elements.calculationSection.style.display = 'block';
        elements.resultSection.style.display = 'block';
    }

    function hideSections() {
        elements.ingredientsSection.style.display = 'none';
        elements.calculationSection.style.display = 'none';
        elements.resultSection.style.display = 'none';
    }

    function clearIngredients() {
        ingredients = [];
        originalPortions = 4;
        elements.portionsOriginal.value = 4;
        elements.portionsTarget.value = 4;
        elements.multiplier.value = 1;
        elements.descriptionInput.value = '';
        elements.urlInput.value = '';

        // Reset portions indicator
        elements.portionsOriginalGroup.classList.remove('needs-check', 'confirmed');

        // Reset collapsed state and count
        elements.ingredientsSection.classList.remove('collapsed');
        elements.ingredientCount.textContent = '';

        // Clear manual form
        elements.manualForm.innerHTML = '';
        addManualIngredient();

        hideSections();
        showToast('Liste reinitalisee');
    }

    // ==================== CALCULATION ====================

    function initCalculation() {
        // Calc mode switch
        elements.calcModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isPortions = e.target.value === 'portions';
                elements.portionsRow.style.display = isPortions ? 'flex' : 'none';
                elements.multiplierInputGroup.style.display = isPortions ? 'none' : 'block';
                updateResults();
            });
        });

        // Collapsible ingredients toggle
        elements.ingredientsToggle.addEventListener('click', () => {
            elements.ingredientsSection.classList.toggle('collapsed');
        });

        // Portions original change
        elements.portionsOriginal.addEventListener('change', (e) => {
            originalPortions = parseInt(e.target.value) || 4;
            // Marquer comme confirme quand l'utilisateur modifie manuellement
            elements.portionsOriginalGroup.classList.remove('needs-check');
            elements.portionsOriginalGroup.classList.add('confirmed');
            updateResults();
        });

        // Portions target change
        elements.portionsTarget.addEventListener('input', updateResults);

        // Multiplier change
        elements.multiplier.addEventListener('input', updateResults);

        // Quick multipliers
        elements.quickMultipliers.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseFloat(btn.dataset.multiplier);
                elements.multiplier.value = value;

                // Update active state
                elements.quickMultipliers.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                updateResults();
            });
        });
    }

    function getMultiplier() {
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;

        if (mode === 'portions') {
            const target = parseInt(elements.portionsTarget.value) || originalPortions;
            return target / originalPortions;
        } else {
            return parseFloat(elements.multiplier.value) || 1;
        }
    }

    function updateResults() {
        const multiplier = getMultiplier();

        // Update result info
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;
        if (mode === 'portions') {
            const target = parseInt(elements.portionsTarget.value) || originalPortions;
            elements.resultPortions.textContent = `Pour ${target} portion(s) (x${formatNumber(multiplier)})`;
        } else {
            const newPortions = Math.round(originalPortions * multiplier);
            elements.resultPortions.textContent = `Quantites x${formatNumber(multiplier)} (environ ${newPortions} portions)`;
        }

        // Render results
        elements.resultList.innerHTML = '';

        ingredients.forEach(ing => {
            const item = document.createElement('div');
            item.className = 'result-item';

            let qtyText = '';
            if (ing.quantity !== null && ing.quantity !== undefined) {
                const newQty = ing.quantity * multiplier;
                qtyText = `${formatNumber(newQty)}${ing.unit ? ' ' + ing.unit : ''}`;
            } else if (ing.unit) {
                qtyText = ing.unit;
            }

            item.innerHTML = `
                <span class="result-item-qty">${qtyText}</span>
                <span class="result-item-name">${ing.name}</span>
            `;
            elements.resultList.appendChild(item);
        });
    }

    // ==================== COPY RESULT ====================

    function copyResult() {
        const multiplier = getMultiplier();
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;

        let text = '';

        if (mode === 'portions') {
            const target = parseInt(elements.portionsTarget.value) || originalPortions;
            text += `Pour ${target} portion(s):\n\n`;
        } else {
            const newPortions = Math.round(originalPortions * multiplier);
            text += `Quantites x${formatNumber(multiplier)} (${newPortions} portions):\n\n`;
        }

        ingredients.forEach(ing => {
            let line = '';
            if (ing.quantity !== null && ing.quantity !== undefined) {
                const newQty = ing.quantity * multiplier;
                line = `- ${formatNumber(newQty)}${ing.unit ? ' ' + ing.unit : ''} ${ing.name}`;
            } else {
                line = `- ${ing.unit ? ing.unit + ' ' : ''}${ing.name}`;
            }
            text += line + '\n';
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast('Liste copiee!', 'success');
        }).catch(() => {
            showToast('Erreur lors de la copie', 'error');
        });
    }

    // ==================== SERVICE WORKER ====================

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    // ==================== INIT ====================

    function init() {
        // Initialize tabs
        initTabs();

        // Initialize calculation
        initCalculation();

        // URL fetch
        elements.fetchBtn.addEventListener('click', fetchFromUrl);
        elements.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchFromUrl();
        });

        // Description extract
        elements.extractBtn.addEventListener('click', extractFromDescription);

        // Manual input
        elements.addIngredientBtn.addEventListener('click', addManualIngredient);
        addManualIngredient(); // Add first row

        // Clear
        elements.clearIngredientsBtn.addEventListener('click', clearIngredients);

        // Copy result
        elements.copyResultBtn.addEventListener('click', copyResult);

        // Register service worker
        registerServiceWorker();
    }

    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
