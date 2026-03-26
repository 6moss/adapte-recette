/**
 * Application principale - Adapte Recette
 */

(function() {
    'use strict';

    // State
    let ingredients = [];
    let originalPortions = 4;

    // ==================== CATÉGORIES D'INGRÉDIENTS ====================
    // Règles intelligentes selon le type d'ingrédient

    const INGREDIENT_CATEGORIES = {
        // Épices et aromates : ne pas multiplier proportionnellement
        spices: [
            'sel', 'poivre', 'piment', 'paprika', 'cumin', 'curry', 'curcuma',
            'cannelle', 'muscade', 'gingembre', 'cardamome', 'coriandre',
            'thym', 'romarin', 'basilic', 'persil', 'ciboulette', 'aneth',
            'menthe', 'origan', 'laurier', 'sauge', 'estragon', 'cerfeuil',
            'herbes de provence', 'bouquet garni', 'fines herbes',
            'ail', 'oignon', 'echalote', 'échalote',
            'vanille', 'safran', 'clou de girofle', 'anis', 'fenouil',
            'piment d\'espelette', 'cayenne', 'tabasco', 'harissa',
            'noix de muscade', 'quatre épices', '4 épices',
            'herbes', 'épices', 'aromates', 'assaisonnement'
        ],
        // Levures et agents levants : plafonner à x2
        leavening: [
            'levure', 'levure chimique', 'levure boulangère', 'levure de boulanger',
            'levure fraîche', 'levure sèche', 'levure instantanée',
            'bicarbonate', 'bicarbonate de soude', 'baking powder', 'baking soda',
            'poudre à lever', 'poudre levante'
        ],
        // Matières grasses de cuisson : ne pas multiplier au-delà de x1.5
        cookingFat: [
            'huile pour la cuisson', 'huile de cuisson',
            'beurre pour la poêle', 'beurre pour graisser',
            'huile pour friture', 'huile de friture',
            'graisse', 'saindoux', 'margarine pour cuisson'
        ]
    };

    /**
     * Détecte la catégorie d'un ingrédient
     */
    function getIngredientCategory(ingredientName) {
        if (!ingredientName) return 'standard';
        const name = ingredientName.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
            for (const keyword of keywords) {
                const normalizedKeyword = keyword.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (name.includes(normalizedKeyword) || normalizedKeyword.includes(name)) {
                    return category;
                }
            }
        }
        return 'standard';
    }

    /**
     * Calcule le multiplicateur ajusté selon la catégorie
     * Basé sur les règles de l'article /blog/adapter-recette-nombre-personnes
     */
    function getAdjustedMultiplier(baseMultiplier, category) {
        switch (category) {
            case 'spices':
                // Épices : x2 → 1.5x, x3 → 2x, /2 → 0.65x
                if (baseMultiplier >= 3) {
                    return 2;
                } else if (baseMultiplier >= 2) {
                    return 1.5;
                } else if (baseMultiplier <= 0.5) {
                    return 0.65;
                } else if (baseMultiplier < 1) {
                    // Interpolation linéaire entre 0.5 et 1
                    return 0.65 + (baseMultiplier - 0.5) * (1 - 0.65) / 0.5;
                } else {
                    // Entre 1 et 2 : interpolation
                    return 1 + (baseMultiplier - 1) * 0.5;
                }

            case 'leavening':
                // Levure : plafonner à x2
                return Math.min(baseMultiplier, 2);

            case 'cookingFat':
                // Matières grasses de cuisson : plafonner à x1.5
                return Math.min(baseMultiplier, 1.5);

            default:
                return baseMultiplier;
        }
    }

    /**
     * Retourne une info-bulle explicative pour l'ajustement
     */
    function getAdjustmentTooltip(category, baseMultiplier, adjustedMultiplier) {
        if (baseMultiplier === adjustedMultiplier) return null;

        switch (category) {
            case 'spices':
                return `Ajusté : les épices ne se multiplient pas proportionnellement (x${formatNumber(adjustedMultiplier)} au lieu de x${formatNumber(baseMultiplier)})`;
            case 'leavening':
                return `Plafonné à x2 : trop de levure fait s'effondrer les gâteaux`;
            case 'cookingFat':
                return `Ajusté : la quantité d'huile de cuisson dépend de la taille de la poêle, pas des portions`;
            default:
                return null;
        }
    }

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
        }, 6000);
    }

    function showNoIngredientsError() {
        // Create a more detailed error popup
        const existingPopup = document.querySelector('.error-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'error-popup';
        popup.innerHTML = `
            <div class="error-popup-content">
                <h4>Aucun ingrédient détecté</h4>
                <p>La description ne semble pas contenir d'ingrédients au format reconnaissable.</p>
                <p><strong>Causes possibles :</strong></p>
                <ul>
                    <li>Les ingrédients sont dans les commentaires ou une autre publication</li>
                    <li>La description contient uniquement du texte ou des emojis</li>
                    <li>Le format des ingrédients n'est pas standard (ex: "200g farine")</li>
                </ul>
                <p><strong>Solutions :</strong></p>
                <ul>
                    <li>Copiez les ingrédients depuis les commentaires</li>
                    <li>Reformulez au format "quantité + ingrédient" (ex: 200g farine)</li>
                    <li>Utilisez l'onglet "Manuel" pour saisir les ingrédients</li>
                </ul>
                <button class="btn btn-primary error-popup-close">Compris</button>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.error-popup-close').addEventListener('click', () => {
            popup.remove();
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.remove();
        });
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '';

        // Arrondir à 2 décimales
        const rounded = Math.round(num * 100) / 100;

        // Si c'est un entier, ne pas afficher de décimales
        if (rounded === Math.floor(rounded)) {
            return rounded.toString();
        }

        // Afficher avec virgule (format français)
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

        // Check if it's Instagram, TikTok or Facebook
        if (!url.includes('instagram.com') && !url.includes('tiktok.com') && !url.includes('facebook.com') && !url.includes('fb.watch')) {
            showToast('Seuls Instagram, TikTok et Facebook sont supportés', 'error');
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
                    showToast(`${parsed.length} ingrédient(s) trouvé(s)`, 'success');
                } else {
                    // Fallback to description tab with the text
                    switchToDescriptionTab(data.description);
                    showToast('Description récupérée mais aucun ingrédient détecté. Cliquez sur "Extraire" ou reformulez le texte.', 'info');
                }
            } else if (data.fallback || data.error) {
                // API failed, switch to description tab
                switchToDescriptionTab('');
                showToast(data.error || 'Copiez-collez la description manuellement', 'error');
            } else {
                throw new Error('Aucune description trouvée');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            switchToDescriptionTab('');
            showToast('Erreur réseau. Collez la description manuellement.', 'error');
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
            showToast(`${parsed.length} ingrédient(s) extrait(s)`, 'success');
        } else {
            showNoIngredientsError();
        }
    }

    // ==================== MANUAL INPUT ====================

    function createManualRow(ingredient = null) {
        const row = document.createElement('div');
        row.className = 'manual-row';
        row.innerHTML = `
            <input type="number" class="ingredient-qty" placeholder="Qté" step="any" value="${ingredient?.quantity || ''}">
            <input type="text" class="ingredient-unit" placeholder="Unité" value="${ingredient?.unit || ''}">
            <input type="text" class="ingredient-name" placeholder="Ingrédient" value="${ingredient?.name || ''}">
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
            // Portions détectées dans le texte
            originalPortions = portions;
            elements.portionsOriginal.value = portions;
            // Target toujours supérieur à l'original (au moins +1, minimum 2)
            const targetPortions = Math.max(portions + 1, 2);
            elements.portionsTarget.value = targetPortions;
            elements.portionsOriginalGroup.classList.remove('needs-check');
            elements.portionsOriginalGroup.classList.add('confirmed');
        } else {
            // Portions non détectées - afficher l'indicateur
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
        showToast('Liste réinitialisée');
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
            // Marquer comme confirmé quand l'utilisateur modifie manuellement
            elements.portionsOriginalGroup.classList.remove('needs-check');
            elements.portionsOriginalGroup.classList.add('confirmed');
            updateResults();
        });

        // Portions target change
        elements.portionsTarget.addEventListener('input', updateResults);

        // Stepper buttons (+/-)
        document.getElementById('portions-minus').addEventListener('click', () => {
            const current = parseInt(elements.portionsTarget.value) || 1;
            if (current > 1) {
                elements.portionsTarget.value = current - 1;
                updateResults();
            }
        });

        document.getElementById('portions-plus').addEventListener('click', () => {
            const current = parseInt(elements.portionsTarget.value) || 1;
            elements.portionsTarget.value = current + 1;
            updateResults();
        });

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
        const baseMultiplier = getMultiplier();

        // Update result info
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;
        if (mode === 'portions') {
            const target = parseInt(elements.portionsTarget.value) || originalPortions;
            elements.resultPortions.textContent = `Pour ${target} portion(s) (x${formatNumber(baseMultiplier)})`;
        } else {
            const newPortions = Math.round(originalPortions * baseMultiplier);
            elements.resultPortions.textContent = `Quantités x${formatNumber(baseMultiplier)} (environ ${newPortions} portions)`;
        }

        // Render results with smart adjustments
        elements.resultList.innerHTML = '';
        let hasAdjustments = false;

        ingredients.forEach(ing => {
            const item = document.createElement('div');
            item.className = 'result-item';

            // Détecte la catégorie et applique l'ajustement
            const category = getIngredientCategory(ing.name);
            const adjustedMultiplier = getAdjustedMultiplier(baseMultiplier, category);
            const isAdjusted = Math.abs(adjustedMultiplier - baseMultiplier) > 0.01;

            if (isAdjusted) hasAdjustments = true;

            let qtyText = '';
            let tooltip = '';

            if (ing.quantity !== null && ing.quantity !== undefined) {
                const newQty = ing.quantity * adjustedMultiplier;
                qtyText = `${formatNumber(newQty)}${ing.unit ? ' ' + ing.unit : ''}`;

                if (isAdjusted) {
                    tooltip = getAdjustmentTooltip(category, baseMultiplier, adjustedMultiplier);
                }
            } else if (ing.unit) {
                qtyText = ing.unit;
            }

            // Classe CSS pour les ajustements
            const adjustedClass = isAdjusted ? 'adjusted' : '';
            const categoryIcon = isAdjusted ? getCategoryIcon(category) : '';

            item.innerHTML = `
                <span class="result-item-qty ${adjustedClass}" ${tooltip ? `title="${tooltip}"` : ''}>${qtyText}${categoryIcon}</span>
                <span class="result-item-name">${ing.name}</span>
            `;
            elements.resultList.appendChild(item);
        });

        // Affiche un message si des ajustements ont été faits
        const existingNote = elements.resultSection.querySelector('.smart-note');
        if (existingNote) existingNote.remove();

        if (hasAdjustments && baseMultiplier !== 1) {
            const note = document.createElement('p');
            note.className = 'smart-note';
            note.innerHTML = '⚡ <em>Certaines quantités ont été ajustées intelligemment (épices, levure). Survolez pour plus d\'infos.</em>';
            elements.resultList.after(note);
        }
    }

    /**
     * Retourne une icône pour la catégorie
     */
    function getCategoryIcon(category) {
        switch (category) {
            case 'spices': return ' <span class="adj-icon" title="Épices ajustées">🌿</span>';
            case 'leavening': return ' <span class="adj-icon" title="Levure plafonnée">⬆️</span>';
            case 'cookingFat': return ' <span class="adj-icon" title="Huile ajustée">🍳</span>';
            default: return '';
        }
    }

    // ==================== COPY RESULT ====================

    function copyResult() {
        const baseMultiplier = getMultiplier();
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;

        let text = '';

        if (mode === 'portions') {
            const target = parseInt(elements.portionsTarget.value) || originalPortions;
            text += `Pour ${target} portion(s):\n\n`;
        } else {
            const newPortions = Math.round(originalPortions * baseMultiplier);
            text += `Quantités x${formatNumber(baseMultiplier)} (${newPortions} portions):\n\n`;
        }

        ingredients.forEach(ing => {
            // Applique les mêmes ajustements que pour l'affichage
            const category = getIngredientCategory(ing.name);
            const adjustedMultiplier = getAdjustedMultiplier(baseMultiplier, category);

            let line = '';
            if (ing.quantity !== null && ing.quantity !== undefined) {
                const newQty = ing.quantity * adjustedMultiplier;
                line = `- ${formatNumber(newQty)}${ing.unit ? ' ' + ing.unit : ''} ${ing.name}`;
            } else {
                line = `- ${ing.unit ? ing.unit + ' ' : ''}${ing.name}`;
            }
            text += line + '\n';
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast('Liste copiée !', 'success');
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
