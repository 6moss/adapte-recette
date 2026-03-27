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
        // ==================== ÉPICES ET AROMATES (500+ termes) ====================
        // Ne pas multiplier proportionnellement (trop = immangeable)
        spices: [
            // ========== SEL (40+ variétés) ==========
            'sel', 'salt', 'sel fin', 'sel de mer', 'sea salt', 'fleur de sel',
            'sel de guérande', 'sel rose', 'pink salt', 'sel noir', 'black salt',
            'sel gemme', 'rock salt', 'sel casher', 'kosher salt', 'sel fumé', 'smoked salt',
            'sel au céleri', 'celery salt', 'sel assaisonné', 'seasoned salt',
            'sel marin', 'sel iodé', 'iodized salt', 'gros sel', 'coarse salt',
            'sel de l\'himalaya', 'himalayan salt', 'sel hawaien', 'hawaiian salt',
            'sel de maldon', 'maldon salt', 'sel murray river', 'sel de finition', 'finishing salt',
            'cristaux de sel', 'salt flakes', 'sel en flocons', 'flaky salt',
            'sel de table', 'table salt', 'sel de cuisine', 'cooking salt',
            'sel gris', 'grey salt', 'sel bleu', 'blue salt', 'sel rouge', 'red salt',

            // ========== POIVRE (30+ variétés) ==========
            'poivre', 'pepper', 'poivre noir', 'black pepper', 'poivre blanc', 'white pepper',
            'poivre vert', 'green pepper', 'poivre de sichuan', 'sichuan pepper', 'szechuan pepper',
            'poivre de cayenne', 'cayenne pepper', 'poivre long', 'long pepper',
            'mélange de poivres', 'pepper mix', 'poivre moulu', 'ground pepper',
            'poivre de kampot', 'kampot pepper', 'poivre de sarawak', 'sarawak pepper',
            'poivre rouge', 'red pepper', 'poivre de selim', 'selim pepper',
            'maniguette', 'grains of paradise', 'poivre de guinée',
            'poivre de tellicherry', 'tellicherry pepper', 'poivre cubèbe', 'cubeb pepper',
            'poivre rose', 'pink peppercorn', 'baies roses',
            'poivre de timut', 'timut pepper', 'poivre de voatsiperifery',
            'poivre concassé', 'cracked pepper', 'poivre en grains', 'peppercorns',
            'poivre mignonette', 'mignonnette pepper',

            // ========== PIMENTS (50+ variétés) ==========
            'piment', 'chili', 'chilli', 'chile', 'hot pepper',
            'piment d\'espelette', 'espelette pepper', 'piment doux', 'sweet pepper',
            'piment fort', 'hot chili', 'piment oiseau', 'bird\'s eye chili', 'thai chili',
            'piment jalapeño', 'jalapeño', 'jalapeno', 'piment habanero', 'habanero',
            'piment chipotle', 'chipotle', 'piment ancho', 'ancho', 'chile ancho',
            'piment de jamaïque', 'allspice', 'piment rouge', 'red pepper flakes',
            'flocons de piment', 'chili flakes', 'crushed red pepper',
            'piment serrano', 'serrano', 'piment poblano', 'poblano',
            'piment guajillo', 'guajillo', 'piment pasilla', 'pasilla',
            'piment de padrón', 'padron pepper', 'piment shishito', 'shishito',
            'piment calabrais', 'calabrian chili', 'piment d\'alep', 'aleppo pepper',
            'piment urfa', 'urfa biber', 'piment maras', 'maras pepper',
            'piment kashmiri', 'kashmiri chili', 'piment de la vera', 'pimenton de la vera',
            'piment scotch bonnet', 'scotch bonnet', 'piment carolina reaper',
            'piment ghost', 'ghost pepper', 'bhut jolokia',
            'piment cayenne', 'cayenne', 'piment séché', 'dried chili',
            'piment en poudre', 'chili powder', 'chile powder',
            'sriracha', 'tabasco', 'harissa', 'sambal', 'sambal oelek',
            'gochugaru', 'gochujang', 'piment coréen', 'korean chili',
            'togarashi', 'shichimi togarashi', 'ichimi togarashi',
            'piri piri', 'peri peri', 'cholula', 'frank\'s red hot',

            // ========== ÉPICES EN POUDRE (100+ variétés) ==========
            'paprika', 'paprika fumé', 'smoked paprika', 'pimentón', 'pimenton',
            'paprika doux', 'sweet paprika', 'paprika fort', 'hot paprika',
            'cumin', 'cumin moulu', 'ground cumin', 'graines de cumin', 'cumin seeds',
            'curry', 'curry powder', 'poudre de curry', 'curry en poudre',
            'garam masala', 'masala', 'tandoori', 'tikka masala', 'madras',
            'curry madras', 'curry thai', 'curry vert', 'curry rouge', 'curry jaune',
            'pâte de curry', 'curry paste', 'green curry paste', 'red curry paste',
            'curcuma', 'turmeric', 'safran des indes', 'curcuma frais', 'fresh turmeric',
            'cannelle', 'cinnamon', 'cannelle moulue', 'ground cinnamon',
            'cannelle en bâton', 'cinnamon stick', 'cannelle de ceylan', 'ceylon cinnamon',
            'cannelle cassia', 'cassia', 'cannelle de chine',
            'muscade', 'nutmeg', 'noix de muscade', 'muscade râpée', 'grated nutmeg',
            'macis', 'mace', 'fleur de muscade',
            'gingembre', 'ginger', 'gingembre moulu', 'ground ginger', 'gingembre en poudre',
            'gingembre frais', 'fresh ginger', 'gingembre confit', 'crystallized ginger',
            'galanga', 'galangal', 'gingembre thaï',
            'cardamome', 'cardamom', 'cardamome verte', 'green cardamom',
            'cardamome noire', 'black cardamom', 'cardamome moulue', 'ground cardamom',
            'coriandre', 'coriander', 'coriandre moulue', 'ground coriander',
            'graines de coriandre', 'coriander seeds', 'cilantro seeds',
            'fenouil', 'fennel', 'graines de fenouil', 'fennel seeds', 'fenouil moulu',
            'anis', 'anise', 'anis étoilé', 'star anise', 'badiane', 'anis vert',
            'carvi', 'caraway', 'graines de carvi', 'caraway seeds', 'cumin des prés',
            'fenugrec', 'fenugreek', 'graines de fenugrec', 'methi',
            'sumac', 'zaatar', 'za\'atar', 'zatar', 'ras el hanout', 'berbère', 'berbere',
            'cinq épices', 'five spice', 'chinese five spice', '5 épices',
            'quatre épices', 'four spice', '4 épices',
            'colombo', 'vadouvan', 'dukkah', 'baharat', 'advieh',
            'épices cajun', 'cajun seasoning', 'épices créoles', 'creole seasoning',
            'épices mexicaines', 'mexican seasoning', 'taco seasoning',
            'épices tex-mex', 'chili con carne seasoning',
            'old bay', 'old bay seasoning', 'épices pour poisson',
            'épices pour pain d\'épices', 'gingerbread spice', 'pumpkin spice',
            'épices pour vin chaud', 'mulled wine spice', 'glühwein gewürz',
            'shichimi', 'nanami togarashi', 'furikake',

            // ========== CLOUS, GRAINES ET BAIES (40+ variétés) ==========
            'clou de girofle', 'clove', 'cloves', 'girofle', 'clous de girofle',
            'baies de genièvre', 'juniper berries', 'genièvre',
            'graines de moutarde', 'mustard seeds', 'moutarde en grains',
            'graines de moutarde jaune', 'yellow mustard seeds',
            'graines de moutarde noire', 'black mustard seeds',
            'graines de sésame', 'sesame seeds', 'sésame', 'sesame',
            'sésame blanc', 'white sesame', 'sésame noir', 'black sesame',
            'sésame grillé', 'toasted sesame',
            'graines de pavot', 'poppy seeds', 'pavot',
            'graines de nigelle', 'nigella seeds', 'cumin noir', 'black cumin', 'kalonji',
            'graines de chia', 'chia seeds', 'graines de lin', 'flax seeds', 'linseed',
            'graines de chanvre', 'hemp seeds',
            'graines de tournesol', 'sunflower seeds', 'graines de courge', 'pumpkin seeds',
            'pignons', 'pine nuts', 'pignons de pin',
            'baies de goji', 'goji berries', 'baies de sumac',
            'graines de grenade', 'pomegranate seeds', 'anardana',
            'graines de céleri', 'celery seeds', 'graines d\'aneth', 'dill seeds',
            'graines de coriandre', 'coriander seeds',

            // ========== SAFRAN ET ÉPICES PRÉCIEUSES ==========
            'safran', 'saffron', 'pistils de safran', 'saffron threads',
            'safran en poudre', 'saffron powder', 'safran iranien', 'safran espagnol',
            'vanille', 'vanilla', 'gousse de vanille', 'vanilla bean', 'vanilla pod',
            'extrait de vanille', 'vanilla extract', 'arôme vanille', 'vanilla essence',
            'vanille bourbon', 'bourbon vanilla', 'vanille de tahiti', 'tahitian vanilla',
            'vanille de madagascar', 'madagascar vanilla', 'poudre de vanille', 'vanilla powder',
            'sucre vanillé', 'vanilla sugar',

            // ========== HERBES FRAÎCHES ET SÉCHÉES (100+ variétés) ==========
            'thym', 'thyme', 'thym frais', 'fresh thyme', 'thym séché', 'dried thyme',
            'thym citron', 'lemon thyme', 'thym commun', 'common thyme',
            'romarin', 'rosemary', 'romarin frais', 'fresh rosemary', 'romarin séché',
            'basilic', 'basil', 'basilic frais', 'fresh basil', 'basilic séché',
            'basilic thaï', 'thai basil', 'basilic citron', 'lemon basil',
            'basilic pourpre', 'purple basil', 'basilic sacré', 'holy basil', 'tulsi',
            'persil', 'parsley', 'persil plat', 'flat leaf parsley', 'italian parsley',
            'persil frisé', 'curly parsley', 'persil frais', 'fresh parsley',
            'ciboulette', 'chives', 'ciboulette fraîche', 'fresh chives',
            'ciboulette chinoise', 'chinese chives', 'garlic chives',
            'aneth', 'dill', 'aneth frais', 'fresh dill', 'aneth séché',
            'menthe', 'mint', 'menthe fraîche', 'fresh mint', 'menthe séchée',
            'menthe poivrée', 'peppermint', 'menthe verte', 'spearmint',
            'menthe marocaine', 'moroccan mint', 'menthe vietnamienne', 'vietnamese mint',
            'origan', 'oregano', 'origan frais', 'fresh oregano', 'origan séché', 'dried oregano',
            'origan mexicain', 'mexican oregano', 'origan grec', 'greek oregano',
            'laurier', 'bay leaf', 'bay leaves', 'feuille de laurier', 'laurier sauce',
            'laurier frais', 'fresh bay leaf', 'laurier séché', 'dried bay leaf',
            'sauge', 'sage', 'sauge fraîche', 'fresh sage', 'sauge séchée',
            'sauge officinale', 'common sage', 'sauge ananas', 'pineapple sage',
            'estragon', 'tarragon', 'estragon frais', 'fresh tarragon', 'estragon français',
            'cerfeuil', 'chervil', 'cerfeuil frais', 'fresh chervil',
            'marjolaine', 'marjoram', 'marjolaine fraîche', 'sweet marjoram',
            'sarriette', 'savory', 'sarriette fraîche', 'summer savory', 'winter savory',
            'livèche', 'lovage', 'céleri perpétuel', 'ache des montagnes',
            'citronnelle', 'lemongrass', 'lemon grass', 'citronnelle fraîche',
            'feuilles de combava', 'kaffir lime leaves', 'combava', 'makrut lime leaves',
            'feuilles de curry', 'curry leaves', 'kaloupilé',
            'shiso', 'perilla', 'shiso vert', 'shiso rouge',
            'hysope', 'hyssop', 'mélisse', 'lemon balm', 'melissa',
            'absinthe', 'wormwood', 'bourrache', 'borage',
            'capucine', 'nasturtium', 'verveine', 'verbena', 'lemon verbena',
            'camomille', 'chamomile', 'tilleul', 'linden',
            'angélique', 'angelica', 'armoise', 'mugwort',
            'achillée', 'yarrow', 'rue', 'rue plant',
            'pimprenelle', 'salad burnet', 'cresson', 'watercress', 'cress',
            'oseille', 'sorrel', 'pourpier', 'purslane',
            'mitsuba', 'japanese parsley', 'kinome', 'shungiku', 'chrysanthemum greens',
            'rau ram', 'vietnamese coriander', 'culantro', 'recao', 'ngo gai',

            // ========== MÉLANGES D\'HERBES ==========
            'herbes de provence', 'herbes de Provence', 'provence herbs',
            'bouquet garni', 'fines herbes', 'mixed herbs',
            'herbes', 'herbs', 'herbes fraîches', 'fresh herbs',
            'herbes séchées', 'dried herbs', 'herbes aromatiques',
            'italian seasoning', 'assaisonnement italien', 'italian herbs',
            'herbes à poisson', 'fish herbs', 'herbes à volaille', 'poultry herbs',
            'herbes à gigot', 'lamb herbs',

            // ========== ALLIACÉES (50+ variétés) ==========
            'ail', 'garlic', 'gousse d\'ail', 'garlic clove', 'gousses d\'ail',
            'ail frais', 'fresh garlic', 'ail nouveau', 'new garlic',
            'ail en poudre', 'garlic powder', 'ail semoule', 'granulated garlic',
            'ail noir', 'black garlic', 'ail confit', 'confit garlic',
            'ail des ours', 'wild garlic', 'bear garlic', 'ramsons',
            'ail rose de lautrec', 'lautrec pink garlic',
            'ail fumé', 'smoked garlic', 'ail rôti', 'roasted garlic',
            'oignon', 'onion', 'oignon jaune', 'yellow onion',
            'oignon rouge', 'red onion', 'oignon blanc', 'white onion',
            'oignon doux', 'sweet onion', 'oignon vidalia', 'vidalia onion',
            'oignon walla walla', 'walla walla onion',
            'oignon des cévennes', 'cevennes onion', 'oignon de roscoff', 'roscoff onion',
            'oignon nouveau', 'spring onion', 'oignon vert', 'green onion', 'scallion',
            'oignon frit', 'fried onion', 'crispy onions',
            'oignon en poudre', 'onion powder', 'oignon déshydraté',
            'oignon caramélisé', 'caramelized onion',
            'cipollini', 'cipollini onion', 'oignon grelot', 'pearl onion',
            'échalote', 'echalote', 'shallot', 'échalote grise', 'échalote rose',
            'échalote de jersey', 'jersey shallot', 'échalote française', 'french shallot',
            'ciboule', 'welsh onion', 'cive', 'bunching onion',
            'poireau', 'leek', 'blanc de poireau', 'vert de poireau',
            'poireau nouveau', 'baby leek', 'jeune poireau',
            'ramps', 'wild leeks', 'ail sauvage',

            // ========== ZESTES ET ARÔMES ==========
            'zeste', 'zest', 'zeste de citron', 'lemon zest', 'citron zeste',
            'zeste d\'orange', 'orange zest', 'zeste de lime', 'lime zest',
            'zeste de citron vert', 'zeste de pamplemousse', 'grapefruit zest',
            'zeste de yuzu', 'yuzu zest', 'zeste de bergamote', 'bergamot zest',
            'zeste de clémentine', 'clementine zest', 'zeste de mandarine', 'mandarin zest',
            'écorce d\'orange', 'orange peel', 'écorce de citron', 'lemon peel',
            'eau de fleur d\'oranger', 'orange blossom water', 'orange flower water',
            'eau de rose', 'rose water', 'eau de violette',
            'extrait d\'amande', 'almond extract', 'arôme amande',
            'extrait de citron', 'lemon extract', 'extrait d\'orange', 'orange extract',
            'extrait de menthe', 'mint extract', 'peppermint extract',
            'arôme', 'arome', 'flavoring', 'extract',

            // ========== CONDIMENTS ET ASSAISONNEMENTS (60+ variétés) ==========
            'moutarde', 'mustard', 'moutarde de dijon', 'dijon mustard',
            'moutarde à l\'ancienne', 'whole grain mustard', 'moutarde en grains',
            'moutarde jaune', 'yellow mustard', 'moutarde anglaise', 'english mustard',
            'moutarde de meaux', 'meaux mustard', 'moutarde au miel', 'honey mustard',
            'wasabi', 'raifort', 'horseradish', 'crème de raifort',
            'nuoc mam', 'fish sauce', 'sauce poisson', 'nam pla', 'nuoc cham',
            'sauce soja', 'soy sauce', 'shoyu', 'tamari', 'sauce soja légère', 'light soy sauce',
            'sauce soja foncée', 'dark soy sauce', 'kecap manis',
            'vinaigre', 'vinegar', 'vinaigre balsamique', 'balsamic vinegar',
            'vinaigre de vin rouge', 'red wine vinegar', 'vinaigre de vin blanc', 'white wine vinegar',
            'vinaigre de cidre', 'apple cider vinegar', 'cider vinegar',
            'vinaigre de riz', 'rice vinegar', 'rice wine vinegar',
            'vinaigre de xérès', 'sherry vinegar', 'vinaigre de framboise', 'raspberry vinegar',
            'worcestershire', 'sauce worcestershire', 'lea & perrins',
            'miso', 'miso blanc', 'white miso', 'miso rouge', 'red miso',
            'miso jaune', 'yellow miso', 'pâte de miso', 'miso paste',
            'doenjang', 'doubanjiang', 'dou ban jiang', 'pâte de fèves',
            'hoisin', 'hoisin sauce', 'sauce hoisin',
            'oyster sauce', 'sauce aux huîtres', 'sauce d\'huître',
            'XO sauce', 'sauce XO',
            'tahini', 'tahina', 'pâte de sésame', 'sesame paste',
            'tapenade', 'anchoïade', 'aïoli', 'rouille', 'pistou',
            'pesto', 'pesto genovese', 'pesto rosso',
            'chimichurri', 'zhug', 'zhoug', 'chermoula', 'charmoula',

            // ========== MARQUES ET PRODUITS COMMERCIAUX ==========
            'maggi', 'arôme maggi', 'knorr', 'bouillon cube', 'cube de bouillon',
            'fond de veau', 'beef stock', 'fond de volaille', 'chicken stock',
            'concentré de tomate', 'tomato paste', 'double concentré',

            // ========== TERMES GÉNÉRIQUES ==========
            'épices', 'spices', 'épice', 'spice',
            'aromates', 'aromatics', 'aromate',
            'assaisonnement', 'seasoning', 'assaisonner', 'condiment'
        ],

        // ==================== LEVURES ET AGENTS LEVANTS (50+ termes) ====================
        // Plafonner à x2 (trop = effondrement)
        leavening: [
            // --- Levures biologiques ---
            'levure', 'yeast', 'levure de boulanger', 'baker\'s yeast',
            'levure boulangère', 'bread yeast', 'levure de bière', 'brewer\'s yeast',
            'levure fraîche', 'fresh yeast', 'levure en cube', 'cake yeast', 'compressed yeast',
            'levure sèche', 'dry yeast', 'active dry yeast', 'levure sèche active',
            'levure instantanée', 'instant yeast', 'levure rapide', 'quick yeast', 'rapid rise yeast',
            'levure déshydratée', 'dehydrated yeast', 'levure lyophilisée',
            'levure nutritionnelle', 'nutritional yeast', 'nooch',
            'levure de kéfir', 'kefir yeast',

            // --- Levain et pré-ferments ---
            'levain', 'sourdough starter', 'sourdough', 'starter', 'mother starter',
            'levain naturel', 'natural leaven', 'wild yeast starter',
            'levain dur', 'stiff starter', 'levain liquide', 'liquid starter',
            'chef', 'levain chef', 'rafraîchi', 'discard', 'sourdough discard',
            'poolish', 'biga', 'preferment', 'pré-ferment', 'pre-ferment',
            'pâte fermentée', 'old dough', 'pâte vieille',
            'tangzhong', 'yudane', 'water roux',

            // --- Agents chimiques ---
            'levure chimique', 'baking powder', 'poudre à lever', 'poudre levante',
            'levure alsacienne', 'levure pâtissière', 'levure de pâtisserie',
            'double acting baking powder', 'single acting baking powder',
            'bicarbonate', 'baking soda', 'bicarbonate de soude', 'bicarbonate de sodium',
            'sodium bicarbonate', 'bicarb', 'baking soda', 'soda',
            'crème de tartre', 'cream of tartar', 'tartaric acid', 'acide tartrique',
            'carbonate d\'ammonium', 'ammonium carbonate',

            // --- Autres agents levants ---
            'ammoniaque', 'baker\'s ammonia', 'ammonium bicarbonate',
            'potasse', 'potash', 'carbonate de potassium', 'potassium carbonate',
            'hirschhornsalz',

            // --- Marques ---
            'saf instant', 'fleischmann\'s', 'red star', 'bruggeman'
        ],

        // ==================== MATIÈRES GRASSES DE CUISSON (50+ termes) ====================
        // Plafonner à x1.5 (dépend de la taille du récipient, pas des portions)
        cookingFat: [
            // --- Huiles de cuisson ---
            'huile pour la cuisson', 'cooking oil', 'huile de cuisson',
            'huile pour friture', 'frying oil', 'huile de friture', 'oil for frying',
            'huile pour graisser', 'oil for greasing',
            'huile pour le moule', 'oil for the pan',
            'huile pour la poêle', 'oil for the skillet',
            'huile d\'arachide', 'peanut oil', 'huile de cacahuète',
            'huile de pépin de raisin', 'grapeseed oil', 'huile de pépins de raisin',
            'huile de tournesol', 'sunflower oil',
            'huile de colza', 'canola oil', 'rapeseed oil',
            'huile végétale', 'vegetable oil',
            'huile de maïs', 'corn oil',
            'huile de soja', 'soybean oil',
            'huile de carthame', 'safflower oil',
            'huile de son de riz', 'rice bran oil',
            'huile de coco pour cuisson', 'coconut oil for cooking',
            'huile d\'avocat', 'avocado oil',

            // --- Beurre de cuisson ---
            'beurre pour la poêle', 'butter for the pan',
            'beurre pour graisser', 'butter for greasing',
            'beurre pour le moule', 'butter for the mold',
            'beurre de cuisson', 'cooking butter',
            'beurre pour sauter', 'butter for sautéing',
            'noisette de beurre', 'knob of butter', 'noix de beurre',
            'beurre clarifié', 'clarified butter', 'beurre noisette', 'brown butter',
            'beurre fondu', 'melted butter',

            // --- Graisses animales ---
            'graisse', 'grease', 'fat', 'graisse de cuisson', 'cooking fat',
            'saindoux', 'lard', 'graisse de porc', 'pork fat', 'pork lard',
            'graisse de canard', 'duck fat', 'graisse d\'oie', 'goose fat',
            'suif', 'tallow', 'beef fat', 'graisse de boeuf', 'beef tallow',
            'graisse de bacon', 'bacon fat', 'bacon grease', 'bacon drippings',
            'schmaltz', 'chicken fat', 'graisse de poulet',
            'graisse d\'agneau', 'lamb fat',
            'drippings', 'jus de viande', 'graisse de rôti',

            // --- Autres matières grasses de cuisson ---
            'margarine pour cuisson', 'cooking margarine',
            'végétaline', 'shortening', 'crisco', 'vegetable shortening',
            'ghee pour cuisson', 'cooking ghee', 'ghee',
            'huile de palme', 'palm oil',
            'spray de cuisson', 'cooking spray', 'spray anti-adhésif',
            'pam', 'huile en spray', 'beurre en spray', 'butter spray'
        ]
    };

    // Cache pour éviter de recalculer les catégories
    const categoryCache = new Map();

    /**
     * Détecte la catégorie d'un ingrédient avec tolérance aux typos
     * Utilise FuzzyMatch si disponible, sinon fallback sur le matching simple
     */
    function getIngredientCategory(ingredientName) {
        if (!ingredientName) return 'standard';

        // Vérifier le cache
        const cacheKey = ingredientName.toLowerCase().trim();
        if (categoryCache.has(cacheKey)) {
            return categoryCache.get(cacheKey);
        }

        let result = 'standard';

        // Utiliser FuzzyMatch si disponible
        if (typeof FuzzyMatch !== 'undefined' && FuzzyMatch.belongsToCategory) {
            for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
                if (FuzzyMatch.belongsToCategory(ingredientName, keywords)) {
                    result = category;
                    break;
                }
            }
        } else {
            // Fallback: matching simple sans fuzzy
            const name = ingredientName.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
                for (const keyword of keywords) {
                    const normalizedKeyword = keyword.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    // Utiliser des word boundaries pour éviter "sel" dans "persil"
                    const pattern = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
                    if (pattern.test(name) || (normalizedKeyword.length > 3 && name.includes(normalizedKeyword))) {
                        result = category;
                        break;
                    }
                }
                if (result !== 'standard') break;
            }
        }

        // Mettre en cache le résultat
        categoryCache.set(cacheKey, result);
        return result;
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
