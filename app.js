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
        // ==================== ÉPICES ET AROMATES ====================
        // Ne pas multiplier proportionnellement (trop = immangeable)
        spices: [
            // --- Sel et poivre ---
            'sel', 'salt', 'sel fin', 'sel de mer', 'sea salt', 'fleur de sel',
            'sel de guérande', 'sel rose', 'pink salt', 'sel noir', 'black salt',
            'poivre', 'pepper', 'poivre noir', 'black pepper', 'poivre blanc', 'white pepper',
            'poivre vert', 'green pepper', 'poivre de sichuan', 'sichuan pepper',
            'poivre de cayenne', 'cayenne pepper', 'poivre long', 'long pepper',
            'mélange de poivres', 'pepper mix', 'poivre moulu', 'ground pepper',

            // --- Piments ---
            'piment', 'chili', 'chilli', 'chile', 'hot pepper',
            'piment d\'espelette', 'espelette pepper', 'piment doux', 'sweet pepper',
            'piment fort', 'hot chili', 'piment oiseau', 'bird\'s eye chili',
            'piment jalapeño', 'jalapeño', 'jalapeno', 'piment habanero', 'habanero',
            'piment chipotle', 'chipotle', 'piment ancho', 'ancho',
            'piment de jamaïque', 'allspice', 'piment rouge', 'red pepper flakes',
            'flocons de piment', 'chili flakes', 'crushed red pepper',
            'sriracha', 'tabasco', 'harissa', 'sambal', 'gochugaru', 'gochujang',

            // --- Épices en poudre ---
            'paprika', 'paprika fumé', 'smoked paprika', 'pimentón',
            'cumin', 'cumin moulu', 'ground cumin', 'graines de cumin', 'cumin seeds',
            'curry', 'curry powder', 'poudre de curry', 'curry en poudre',
            'garam masala', 'masala', 'tandoori', 'tikka masala', 'madras',
            'curcuma', 'turmeric', 'safran des indes',
            'cannelle', 'cinnamon', 'cannelle moulue', 'ground cinnamon', 'cannelle en bâton', 'cinnamon stick',
            'muscade', 'nutmeg', 'noix de muscade', 'muscade râpée', 'grated nutmeg',
            'macis', 'mace',
            'gingembre', 'ginger', 'gingembre moulu', 'ground ginger', 'gingembre en poudre',
            'cardamome', 'cardamom', 'cardamome verte', 'green cardamom', 'cardamome noire', 'black cardamom',
            'coriandre', 'coriander', 'coriandre moulue', 'ground coriander', 'graines de coriandre', 'coriander seeds',
            'fenouil', 'fennel', 'graines de fenouil', 'fennel seeds',
            'anis', 'anise', 'anis étoilé', 'star anise', 'badiane',
            'carvi', 'caraway', 'graines de carvi', 'caraway seeds',
            'fenugrec', 'fenugreek', 'graines de fenugrec',
            'sumac', 'zaatar', 'za\'atar', 'ras el hanout', 'berbère', 'berbere',
            'cinq épices', 'five spice', 'chinese five spice', '5 épices',
            'quatre épices', 'four spice', '4 épices', 'allspice',
            'colombo', 'vadouvan', 'dukkah', 'baharat',

            // --- Clous et graines ---
            'clou de girofle', 'clove', 'cloves', 'girofle',
            'baies de genièvre', 'juniper berries', 'genièvre',
            'graines de moutarde', 'mustard seeds', 'moutarde en grains',
            'graines de sésame', 'sesame seeds', 'sésame', 'sesame',
            'graines de pavot', 'poppy seeds', 'pavot',
            'graines de nigelle', 'nigella seeds', 'cumin noir', 'black cumin',

            // --- Safran et épices précieuses ---
            'safran', 'saffron', 'pistils de safran', 'saffron threads',
            'vanille', 'vanilla', 'gousse de vanille', 'vanilla bean', 'vanilla pod',
            'extrait de vanille', 'vanilla extract', 'arôme vanille',

            // --- Herbes fraîches ---
            'thym', 'thyme', 'thym frais', 'fresh thyme', 'thym séché', 'dried thyme',
            'romarin', 'rosemary', 'romarin frais', 'fresh rosemary',
            'basilic', 'basil', 'basilic frais', 'fresh basil', 'basilic thaï', 'thai basil',
            'persil', 'parsley', 'persil plat', 'flat leaf parsley', 'persil frisé', 'curly parsley',
            'ciboulette', 'chives', 'ciboulette fraîche', 'fresh chives',
            'aneth', 'dill', 'aneth frais', 'fresh dill',
            'menthe', 'mint', 'menthe fraîche', 'fresh mint', 'menthe poivrée', 'peppermint',
            'origan', 'oregano', 'origan frais', 'fresh oregano', 'origan séché', 'dried oregano',
            'laurier', 'bay leaf', 'bay leaves', 'feuille de laurier', 'laurier sauce',
            'sauge', 'sage', 'sauge fraîche', 'fresh sage',
            'estragon', 'tarragon', 'estragon frais', 'fresh tarragon',
            'cerfeuil', 'chervil', 'cerfeuil frais', 'fresh chervil',
            'marjolaine', 'marjoram', 'marjolaine fraîche',
            'sarriette', 'savory', 'sarriette fraîche',
            'livèche', 'lovage', 'céleri perpétuel',
            'citronnelle', 'lemongrass', 'lemon grass',
            'feuilles de combava', 'kaffir lime leaves', 'combava',
            'feuilles de curry', 'curry leaves',
            'shiso', 'perilla',

            // --- Mélanges d'herbes ---
            'herbes de provence', 'herbes de Provence', 'provence herbs',
            'bouquet garni', 'fines herbes', 'mixed herbs',
            'herbes', 'herbs', 'herbes fraîches', 'fresh herbs',
            'herbes séchées', 'dried herbs', 'herbes aromatiques',
            'italian seasoning', 'assaisonnement italien',

            // --- Alliacées (ail, oignon, etc.) ---
            'ail', 'garlic', 'gousse d\'ail', 'garlic clove', 'ail frais', 'fresh garlic',
            'ail en poudre', 'garlic powder', 'ail semoule', 'granulated garlic',
            'ail noir', 'black garlic', 'ail des ours', 'wild garlic', 'bear garlic',
            'oignon', 'onion', 'oignon jaune', 'yellow onion', 'oignon rouge', 'red onion',
            'oignon blanc', 'white onion', 'oignon doux', 'sweet onion',
            'oignon nouveau', 'spring onion', 'oignon vert', 'green onion', 'scallion',
            'oignon frit', 'fried onion', 'oignon en poudre', 'onion powder',
            'échalote', 'echalote', 'shallot', 'échalote grise', 'échalote rose',
            'ciboule', 'welsh onion', 'cive',
            'poireau', 'leek', 'blanc de poireau', 'vert de poireau',

            // --- Zestes et arômes ---
            'zeste', 'zest', 'zeste de citron', 'lemon zest', 'zeste d\'orange', 'orange zest',
            'zeste de lime', 'lime zest', 'zeste de citron vert',
            'eau de fleur d\'oranger', 'orange blossom water', 'eau de rose', 'rose water',
            'extrait d\'amande', 'almond extract', 'arôme amande',

            // --- Condiments et assaisonnements ---
            'moutarde', 'mustard', 'moutarde de dijon', 'dijon mustard',
            'moutarde à l\'ancienne', 'whole grain mustard', 'moutarde en grains',
            'wasabi', 'raifort', 'horseradish',
            'nuoc mam', 'fish sauce', 'sauce poisson', 'nam pla',
            'sauce soja', 'soy sauce', 'shoyu', 'tamari',
            'vinaigre', 'vinegar', 'vinaigre balsamique', 'balsamic vinegar',
            'worcestershire', 'sauce worcestershire',

            // --- Termes génériques ---
            'épices', 'spices', 'épice', 'spice',
            'aromates', 'aromatics', 'aromate',
            'assaisonnement', 'seasoning', 'assaisonner'
        ],

        // ==================== LEVURES ET AGENTS LEVANTS ====================
        // Plafonner à x2 (trop = effondrement)
        leavening: [
            // --- Levures biologiques ---
            'levure', 'yeast', 'levure de boulanger', 'baker\'s yeast',
            'levure boulangère', 'bread yeast', 'levure de bière', 'brewer\'s yeast',
            'levure fraîche', 'fresh yeast', 'levure en cube', 'cake yeast',
            'levure sèche', 'dry yeast', 'active dry yeast', 'levure sèche active',
            'levure instantanée', 'instant yeast', 'levure rapide', 'quick yeast',
            'levure déshydratée', 'dehydrated yeast', 'levure lyophilisée',
            'levain', 'sourdough starter', 'sourdough', 'starter',
            'poolish', 'biga', 'preferment', 'pré-ferment',

            // --- Agents chimiques ---
            'levure chimique', 'baking powder', 'poudre à lever', 'poudre levante',
            'levure alsacienne', 'levure pâtissière',
            'bicarbonate', 'baking soda', 'bicarbonate de soude', 'bicarbonate de sodium',
            'sodium bicarbonate', 'bicarb',
            'crème de tartre', 'cream of tartar', 'tartaric acid',

            // --- Autres agents levants ---
            'ammoniaque', 'baker\'s ammonia', 'ammonium bicarbonate',
            'potasse', 'potash', 'carbonate de potassium'
        ],

        // ==================== MATIÈRES GRASSES DE CUISSON ====================
        // Plafonner à x1.5 (dépend de la taille du récipient, pas des portions)
        cookingFat: [
            // --- Huiles de cuisson ---
            'huile pour la cuisson', 'cooking oil', 'huile de cuisson',
            'huile pour friture', 'frying oil', 'huile de friture', 'oil for frying',
            'huile pour graisser', 'oil for greasing',
            'huile pour le moule', 'oil for the pan',
            'huile pour la poêle', 'oil for the skillet',

            // --- Beurre de cuisson ---
            'beurre pour la poêle', 'butter for the pan',
            'beurre pour graisser', 'butter for greasing',
            'beurre pour le moule', 'butter for the mold',
            'beurre de cuisson', 'cooking butter',
            'beurre pour sauter', 'butter for sautéing',
            'noisette de beurre', 'knob of butter',

            // --- Graisses animales ---
            'graisse', 'grease', 'fat', 'graisse de cuisson', 'cooking fat',
            'saindoux', 'lard', 'graisse de porc', 'pork fat',
            'graisse de canard', 'duck fat', 'graisse d\'oie', 'goose fat',
            'suif', 'tallow', 'beef fat', 'graisse de boeuf',
            'schmaltz', 'chicken fat', 'graisse de poulet',

            // --- Autres matières grasses de cuisson ---
            'margarine pour cuisson', 'cooking margarine',
            'végétaline', 'shortening', 'crisco',
            'ghee pour cuisson', 'cooking ghee',
            'spray de cuisson', 'cooking spray', 'spray anti-adhésif'
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
