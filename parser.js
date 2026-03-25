/**
 * Parser d'ingredients pour les recettes de cuisine
 * Extrait les ingredients avec quantites et unites depuis un texte
 */

const IngredientParser = (function() {
    // ==========================================================================
    // LISTE EXHAUSTIVE DES UNITES CULINAIRES (FR + EN)
    // TOUTES LES CLES SONT NORMALISEES (minuscules, sans accents)
    // ==========================================================================
    const UNITS = {
        // === 1. HAUTE PRECISION (Cuisine moleculaire) ===
        'ug': 'µg', 'µg': 'µg', 'mcg': 'µg',
        'microgramme': 'µg', 'microgrammes': 'µg',
        'microgram': 'µg', 'micrograms': 'µg',
        'ul': 'µl', 'µl': 'µl',
        'microlitre': 'µl', 'microlitres': 'µl',
        'microliter': 'µl', 'microliters': 'µl',
        'ppm': 'ppm',

        // === 2. MICRO-MESURES ===
        // Soupcon / Hint (~1/128 c.a.c)
        'idee': 'soupcon', 'idée': 'soupcon',
        'soupcon': 'soupcon', 'soupçon': 'soupcon',
        'hint': 'soupcon',
        // Goutte / Drop (~1/64 c.a.c)
        'larme': 'goutte', 'larmes': 'goutte',
        'goutte': 'goutte', 'gouttes': 'goutte',
        'drop': 'goutte', 'drops': 'goutte',
        'dr': 'goutte', 'gt': 'goutte', 'gtt': 'goutte',
        // Pointe / Smidgen (~1/32 c.a.c)
        'pointe': 'pointe', 'pointes': 'pointe',
        'pointe de couteau': 'pointe',
        'smidgen': 'pointe', 'smdg': 'pointe', 'smi': 'pointe',
        // Pincee / Pinch (~1/16 c.a.c)
        'pincee': 'pincee', 'pincees': 'pincee',
        'pincée': 'pincee', 'pincées': 'pincee',
        'pinch': 'pincee', 'pinches': 'pincee',
        'pn': 'pincee',
        // Trait / Dash (~1/8 c.a.c)
        'trait': 'trait', 'traits': 'trait',
        'dash': 'trait', 'dashes': 'trait', 'ds': 'trait',
        // Tad (~1/4 c.a.c)
        'tad': 'tad', 'bit': 'tad',

        // === 3. MASSE ===
        // Milligramme
        'mg': 'mg',
        'milligramme': 'mg', 'milligrammes': 'mg',
        'milligram': 'mg', 'milligrams': 'mg',
        // Gramme
        'g': 'g', 'gr': 'g',
        'gramme': 'g', 'grammes': 'g',
        'gram': 'g', 'grams': 'g',
        // Kilogramme
        'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg',
        'kilogramme': 'kg', 'kilogrammes': 'kg',
        'kilogram': 'kg', 'kilograms': 'kg',
        // Once (~28.3g)
        'oz': 'oz', 'ozs': 'oz',
        'once': 'oz', 'onces': 'oz',
        'ounce': 'oz', 'ounces': 'oz',
        // Livre (~453.5g)
        'lb': 'lb', 'lbs': 'lb', '#': 'lb',
        'livre': 'lb', 'livres': 'lb',
        'pound': 'lb', 'pounds': 'lb',

        // === 4. VOLUME ===
        // Millilitre
        'ml': 'ml',
        'millilitre': 'ml', 'millilitres': 'ml',
        'milliliter': 'ml', 'milliliters': 'ml',
        // Centilitre
        'cl': 'cl',
        'centilitre': 'cl', 'centilitres': 'cl',
        'centiliter': 'cl', 'centiliters': 'cl',
        // Decilitre
        'dl': 'dl',
        'decilitre': 'dl', 'decilitres': 'dl',
        'décilitre': 'dl', 'décilitres': 'dl',
        'deciliter': 'dl', 'deciliters': 'dl',
        // Litre
        'l': 'L', 'lt': 'L',
        'litre': 'L', 'litres': 'L',
        'liter': 'L', 'liters': 'L',
        // Once liquide (~29.5ml)
        'fl oz': 'fl oz', 'fl. oz': 'fl oz', 'fl.oz': 'fl oz',
        'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz',
        // Pinte
        'pt': 'pinte', 'pinte': 'pinte', 'pintes': 'pinte',
        'pint': 'pinte', 'pints': 'pinte',
        // Quart
        'qt': 'quart', 'qts': 'quart',
        'quart': 'quart', 'quarts': 'quart',
        // Gallon
        'gal': 'gallon', 'gals': 'gallon',
        'gallon': 'gallon', 'gallons': 'gallon',

        // === 5. CUILLERES ===
        // Cuillere a cafe (~5ml) - TOUTES VARIANTES
        'cac': 'c.a.c', 'c a c': 'c.a.c',
        'cac.': 'c.a.c', 'c.a.c': 'c.a.c', 'c.a.c.': 'c.a.c',
        'cac': 'c.a.c', 'càc': 'c.a.c',
        'c.c': 'c.a.c', 'c.c.': 'c.a.c', 'cc': 'c.a.c',
        'cuillere a cafe': 'c.a.c', 'cuillère à café': 'c.a.c',
        'cuilleres a cafe': 'c.a.c', 'cuillères à café': 'c.a.c',
        'cuill a cafe': 'c.a.c', 'cuill. a cafe': 'c.a.c',
        'cuill à café': 'c.a.c', 'cuill. à café': 'c.a.c',
        // Variantes avec "c." + "a/à" + "cafe/café"
        'c. a cafe': 'c.a.c', 'c. à cafe': 'c.a.c', 'c. a café': 'c.a.c', 'c. à café': 'c.a.c',
        'c a cafe': 'c.a.c', 'c à cafe': 'c.a.c', 'c a café': 'c.a.c', 'c à café': 'c.a.c',
        'tsp': 'c.a.c', 'tsps': 'c.a.c',
        'teaspoon': 'c.a.c', 'teaspoons': 'c.a.c',
        // Cuillere a dessert (~10ml)
        'cad': 'c.a.d', 'c a d': 'c.a.d', 'c.a.d': 'c.a.d', 'c.a.d.': 'c.a.d',
        'cuillere a dessert': 'c.a.d', 'cuillère à dessert': 'c.a.d',
        'cuilleres a dessert': 'c.a.d', 'cuillères à dessert': 'c.a.d',
        'c. a dessert': 'c.a.d', 'c. à dessert': 'c.a.d', 'c a dessert': 'c.a.d', 'c à dessert': 'c.a.d',
        'dsp': 'c.a.d', 'dessertspoon': 'c.a.d', 'dessertspoons': 'c.a.d',
        // Cuillere a soupe (~15ml) - TOUTES VARIANTES
        'cas': 'c.a.s', 'c a s': 'c.a.s',
        'cas.': 'c.a.s', 'c.a.s': 'c.a.s', 'c.a.s.': 'c.a.s',
        'càs': 'c.a.s', 'cás': 'c.a.s',
        'c.s': 'c.a.s', 'c.s.': 'c.a.s', 'cs': 'c.a.s',
        'cuillere a soupe': 'c.a.s', 'cuillère à soupe': 'c.a.s',
        'cuilleres a soupe': 'c.a.s', 'cuillères à soupe': 'c.a.s',
        'cuill a soupe': 'c.a.s', 'cuill. a soupe': 'c.a.s',
        'cuill à soupe': 'c.a.s', 'cuill. à soupe': 'c.a.s',
        // Variantes avec "c." + "a/à" + "soupe"
        'c. a soupe': 'c.a.s', 'c. à soupe': 'c.a.s', 'c a soupe': 'c.a.s', 'c à soupe': 'c.a.s',
        'tbsp': 'c.a.s', 'tbsps': 'c.a.s', 'tbl': 'c.a.s', 'tbs': 'c.a.s',
        'tablespoon': 'c.a.s', 'tablespoons': 'c.a.s',

        // === 6. CONTENANTS ===
        // Tasse / Cup
        'tasse': 'tasse', 'tasses': 'tasse',
        'cup': 'tasse', 'cups': 'tasse',
        // Verre
        'verre': 'verre', 'verres': 'verre',
        'glass': 'verre', 'glasses': 'verre',
        // Bol
        'bol': 'bol', 'bols': 'bol',
        'bowl': 'bol', 'bowls': 'bol',
        // Sachet
        'sachet': 'sachet', 'sachets': 'sachet',
        'packet': 'sachet', 'packets': 'sachet',
        'bag': 'sachet', 'bags': 'sachet',
        // Paquet
        'paquet': 'paquet', 'paquets': 'paquet',
        'package': 'paquet', 'packages': 'paquet',
        // Boite
        'boite': 'boite', 'boites': 'boite',
        'boîte': 'boite', 'boîtes': 'boite',
        'can': 'boite', 'cans': 'boite',
        'box': 'boite', 'boxes': 'boite',
        // Pot
        'pot': 'pot', 'pots': 'pot',
        'jar': 'pot', 'jars': 'pot',
        // Bouteille
        'bouteille': 'bouteille', 'bouteilles': 'bouteille',
        'bottle': 'bouteille', 'bottles': 'bouteille',
        // Tube
        'tube': 'tube', 'tubes': 'tube',

        // === 7. MIXOLOGIE ===
        'pony': 'pony', 'ponys': 'pony',
        'jigger': 'jigger', 'jiggers': 'jigger', 'jig': 'jigger',
        'shot': 'shot', 'shots': 'shot',
        'snit': 'snit', 'snits': 'snit',

        // === 8. APPROXIMATIONS ===
        // Noisette (~4g)
        'noisette': 'noisette', 'noisettes': 'noisette',
        'pat': 'noisette', 'pats': 'noisette',
        // Noix (~15g)
        'noix': 'noix',
        'knob': 'noix', 'knobs': 'noix',
        // Filet
        'filet': 'filet', 'filets': 'filet',
        'drizzle': 'filet', 'drizzles': 'filet',
        // Splash
        'splash': 'splash', 'splashes': 'splash',
        // Nuage
        'nuage': 'nuage', 'nuages': 'nuage',
        'voile': 'nuage', 'voiles': 'nuage',
        // Dollop
        'dollop': 'dollop', 'dollops': 'dollop',
        // Poignee
        'poignee': 'poignee', 'poignees': 'poignee',
        'poignée': 'poignee', 'poignées': 'poignee',
        'handful': 'poignee', 'handfuls': 'poignee',
        // Glug
        'glug': 'glug', 'glugs': 'glug',

        // === 9. VEGETAUX ET HERBES ===
        // Gousse (ail)
        'gousse': 'gousse', 'gousses': 'gousse',
        'clove': 'gousse', 'cloves': 'gousse',
        // Brin
        'brin': 'brin', 'brins': 'brin',
        'sprig': 'brin', 'sprigs': 'brin',
        // Feuille
        'feuille': 'feuille', 'feuilles': 'feuille',
        'leaf': 'feuille', 'leaves': 'feuille',
        // Branche
        'branche': 'branche', 'branches': 'branche',
        'stalk': 'branche', 'stalks': 'branche',
        'stem': 'branche', 'stems': 'branche',
        'tige': 'branche', 'tiges': 'branche',
        // Botte
        'botte': 'botte', 'bottes': 'botte',
        'bunch': 'botte', 'bunches': 'botte',
        // Tete
        'tete': 'tete', 'tetes': 'tete',
        'tête': 'tete', 'têtes': 'tete',
        'head': 'tete', 'heads': 'tete',
        // Zeste
        'zeste': 'zeste', 'zestes': 'zeste',
        'zest': 'zeste', 'zests': 'zeste',

        // === 10. PORTIONS ===
        // Tranche
        'tranche': 'tranche', 'tranches': 'tranche',
        'slice': 'tranche', 'slices': 'tranche',
        // Morceau
        'morceau': 'morceau', 'morceaux': 'morceau',
        'piece': 'morceau', 'pieces': 'morceau',
        // Part
        'part': 'part', 'parts': 'part',
        // Portion
        'portion': 'portion', 'portions': 'portion',
        'serving': 'portion', 'servings': 'portion',
        // Filet (poisson)
        'fillet': 'filet', 'fillets': 'filet',
        // Ration
        'ration': 'ration', 'rations': 'ration',
        // Cube
        'cube': 'cube', 'cubes': 'cube',
        // Rondelle
        'rondelle': 'rondelle', 'rondelles': 'rondelle',
        // Quartier
        'quartier': 'quartier', 'quartiers': 'quartier',

        // === 11. MODIFICATEURS ===
        // Gros/Grosse
        'gros': 'gros', 'grosse': 'grosse', 'grosses': 'grosse',
        // Grand/Grande
        'grand': 'grand', 'grands': 'grand',
        'grande': 'grande', 'grandes': 'grande',
        'large': 'large',
        // Petit/Petite
        'petit': 'petit', 'petits': 'petit',
        'petite': 'petite', 'petites': 'petite',
        'small': 'small',
        // Moyen/Moyenne
        'moyen': 'moyen', 'moyens': 'moyen',
        'moyenne': 'moyenne', 'moyennes': 'moyenne',
        'medium': 'medium',
        // Bon/Bonne
        'bon': 'bon', 'bons': 'bon',
        'bonne': 'bonne', 'bonnes': 'bonne',
        // Beau/Belle
        'beau': 'beau', 'beaux': 'beau',
        'belle': 'belle', 'belles': 'belle',
        // Genereux
        'genereux': 'genereux', 'généreuse': 'genereuse',
        'genereuse': 'genereuse', 'genereuses': 'genereuse',
        'généreuse': 'genereuse', 'généreuses': 'genereuse',
        // Rase/Bombee
        'rase': 'rase', 'rases': 'rase',
        'bombee': 'bombee', 'bombees': 'bombee',
        'bombée': 'bombee', 'bombées': 'bombee',
        // Plein
        'plein': 'plein', 'pleine': 'pleine',
        'pleins': 'plein', 'pleines': 'pleine',
    };

    // Creer un mapping normalise (sans accents) pour la recherche
    function normalizeKey(key) {
        return key.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, ' ')
            .replace(/[œ]/g, 'oe')
            .replace(/[æ]/g, 'ae');
    }

    // Creer le Set et le mapping normalise
    const NORMALIZED_UNITS = {};
    for (const [key, value] of Object.entries(UNITS)) {
        NORMALIZED_UNITS[normalizeKey(key)] = value;
    }
    const UNIT_SET = new Set(Object.keys(NORMALIZED_UNITS));

    // Verbes d'action qui indiquent une instruction (pas un ingredient)
    const ACTION_VERBS = [
        'ajouter', 'ajoute', 'ajoutez',
        'melanger', 'melange', 'melangez',
        'couper', 'coupe', 'coupez',
        'faire', 'fait', 'faites',
        'mettre', 'met', 'mettez',
        'verser', 'verse', 'versez',
        'laisser', 'laisse', 'laissez',
        'cuire', 'cuit', 'cuisez',
        'remuer', 'remue', 'remuez',
        'servir', 'sert', 'servez',
        'preparer', 'prepare', 'preparez',
        'chauffer', 'chauffe', 'chauffez',
        'refroidir', 'refroidit', 'refroidissez',
        'mixer', 'mixe', 'mixez',
        'fouetter', 'fouette', 'fouettez',
        'incorporer', 'incorpore', 'incorporez',
        'saupoudrer', 'saupoudre', 'saupoudrez',
        'garnir', 'garnit', 'garnissez',
        'dresser', 'dresse', 'dressez',
        'reserver', 'reserve', 'reservez',
        'enfourner', 'enfourne', 'enfournez',
        'prechauffer', 'prechauffe', 'prechauffez',
        'egoutter', 'egoutte', 'egouttez',
        'rincer', 'rince', 'rincez',
        'eplucher', 'epluche', 'epluchez',
        'emincer', 'emince', 'emincez',
        'hacher', 'hache', 'hachez',
        'ciseler', 'cisele', 'ciselez',
        'assaisonner', 'assaisonne', 'assaisonnez',
        'saler', 'sale', 'salez',
        'poivrer', 'poivre', 'poivrez',
        'deglacer', 'deglace', 'deglacez',
        'nacrer', 'nacre', 'nacrez',
        'revenir', 'revient', 'revenez',
        'sauter', 'saute', 'sautez',
        'rissoler', 'rissole', 'rissolez',
        'dorer', 'dore', 'dorez',
        'gratiner', 'gratine', 'gratinez',
        'puis', 'ensuite', 'enfin', 'maintenant', 'pendant',
        'quand', 'lorsque', 'jusqu',
    ];

    // Mots qui indiquent que c'est PAS un ingredient
    const NOISE_PATTERNS = [
        /^\s*[@#]/,                          // @mentions et #hashtags
        /\d+\s*(comments?|commentaires?)/i,  // "101 comments"
        /\d+\s*(likes?|j'aime)/i,            // "50 likes"
        /\d+\s*(vues?|views?)/i,             // "1000 vues"
        /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
        /(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)/i,
        /^\s*\d{4}\s*$/,                     // Annee seule "2021"
        /^\s*:\s*$/,                         // Juste ":"
        /^\s*(etapes?|steps?|instructions?|preparation)\s*:?\s*$/i,
        /^\s*(ingredients?)\s*:?\s*$/i,      // Titre "ingredients:"
        /suivez|follow|abonne|subscribe/i,
        /lien|link|bio|profil/i,
        /recette|recipe/i,
        /^\s*pour\s+\d+\s*(personnes?|parts?|portions?)\s*:?\s*$/i,
        /^\s*\d+\s*(min|minutes?|h|heures?|hours?)\s*$/i,
        /facile|difficile|moyen|easy|medium|hard/i,
        /^\s*(bon appetit|enjoy|bonne degustation)/i,
    ];

    // Nombres en lettres
    const NUMBER_WORDS = {
        'un': 1, 'une': 1,
        'deux': 2,
        'trois': 3,
        'quatre': 4,
        'cinq': 5,
        'six': 6,
        'sept': 7,
        'huit': 8,
        'neuf': 9,
        'dix': 10,
        'onze': 11,
        'douze': 12,
        'quinze': 15,
        'vingt': 20,
        'demi': 0.5,
        'demie': 0.5,
        'quart': 0.25,
    };

    /**
     * Normalise le texte (supprime accents, met en minuscule)
     */
    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, ' ')
            .replace(/[œ]/g, 'oe')
            .replace(/[æ]/g, 'ae');
    }

    /**
     * Verifie si une ligne est du bruit (pas un ingredient)
     */
    function isNoise(line) {
        const normalized = normalizeText(line);

        // Trop court ou trop long
        if (line.length < 3 || line.length > 150) return true;

        // Patterns de bruit
        for (const pattern of NOISE_PATTERNS) {
            if (pattern.test(line) || pattern.test(normalized)) {
                return true;
            }
        }

        // Commence par un verbe d'action = instruction
        const words = normalized.split(/\s+/);
        if (words.length > 0) {
            const firstWord = words[0].replace(/[^a-z]/g, '');
            if (ACTION_VERBS.includes(firstWord)) {
                return true;
            }
            // "on fait", "on ajoute", etc.
            if (firstWord === 'on' && words.length > 1) {
                const secondWord = words[1].replace(/[^a-z]/g, '');
                if (ACTION_VERBS.includes(secondWord)) {
                    return true;
                }
            }
        }

        // Phrase trop longue sans chiffre = probablement une instruction
        if (line.length > 60 && !/\d/.test(line)) {
            return true;
        }

        return false;
    }

    /**
     * Parse une fraction (ex: "1/2", "3/4")
     */
    function parseFraction(str) {
        const fractionMatch = str.match(/(\d+)\s*\/\s*(\d+)/);
        if (fractionMatch) {
            return parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
        }
        return null;
    }

    /**
     * Parse un nombre (chiffre, fraction ou mot)
     */
    function parseNumber(str) {
        const normalized = normalizeText(str.trim());

        // Nombre en chiffres (avec virgule ou point)
        const numMatch = normalized.match(/^(\d+)[,.]?(\d*)$/);
        if (numMatch) {
            const decimal = numMatch[2] ? '.' + numMatch[2] : '';
            return parseFloat(numMatch[1] + decimal);
        }

        // Fraction
        const fraction = parseFraction(normalized);
        if (fraction !== null) return fraction;

        // Nombre + fraction (ex: "1 1/2")
        const mixedMatch = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
        if (mixedMatch) {
            return parseFloat(mixedMatch[1]) + parseFloat(mixedMatch[2]) / parseFloat(mixedMatch[3]);
        }

        // Nombre en lettres
        if (NUMBER_WORDS[normalized] !== undefined) {
            return NUMBER_WORDS[normalized];
        }

        return null;
    }

    /**
     * Verifie si un mot est une unite valide
     */
    function isValidUnit(word) {
        if (!word) return false;
        const normalized = normalizeText(word.trim().toLowerCase());
        return UNIT_SET.has(normalized);
    }

    /**
     * Trouve l'unite dans une chaine (STRICTEMENT dans la liste)
     * Utilise NORMALIZED_UNITS pour matcher avec ou sans accents
     */
    function findUnit(str) {
        if (!str) return null;
        const normalized = normalizeText(str.trim().toLowerCase());

        // Verifie si c'est directement une unite (via le mapping normalise)
        // Le mapping contient deja toutes les variantes (avec/sans accents, singulier/pluriel)
        // ainsi que les unites multi-mots comme "cuillere a soupe"
        if (NORMALIZED_UNITS[normalized]) {
            return {
                original: str.trim(),
                normalized: NORMALIZED_UNITS[normalized]
            };
        }

        return null;
    }

    // Modificateurs de taille qui peuvent preceder une unite (normalises sans accents)
    const SIZE_MODIFIERS = new Set([
        'grosse', 'grosses', 'gros',
        'grande', 'grandes', 'grand', 'grands',
        'large',
        'petite', 'petites', 'petit', 'petits',
        'small',
        'moyenne', 'moyennes', 'moyen', 'moyens',
        'medium',
        'bonne', 'bonnes', 'bon', 'bons',
        'belle', 'belles', 'beau', 'beaux',
        'genereuse', 'genereuses', 'genereux',
        'rase', 'rases',
        'bombee', 'bombees',
        'plein', 'pleine', 'pleins', 'pleines',
    ]);

    /**
     * Extrait l'unite et le reste du texte
     * Gere les unites composees comme "grosse c.a.s" ou "bonne poignee"
     * Retourne { unit, remaining }
     */
    function extractUnit(text) {
        const words = text.trim().split(/\s+/);
        if (words.length === 0) return { unit: null, remaining: text.trim() };

        let unitParts = [];
        let startIndex = 0;

        // Verifie si le premier mot est un modificateur de taille
        const firstWordNorm = normalizeText(words[0]);
        const hasModifier = SIZE_MODIFIERS.has(firstWordNorm);

        if (hasModifier && words.length > 1) {
            // Cherche une unite apres le modificateur
            for (let len = Math.min(4, words.length - 1); len >= 1; len--) {
                const candidate = words.slice(1, 1 + len).join(' ');
                const found = findUnit(candidate);
                if (found) {
                    // Unite trouvee, on combine modificateur + unite
                    unitParts = [words[0], ...words.slice(1, 1 + len)];
                    startIndex = 1 + len;
                    return {
                        unit: words[0] + ' ' + found.normalized,
                        remaining: words.slice(startIndex).join(' ')
                    };
                }
            }
            // Pas d'unite apres le modificateur, le modificateur est peut-etre l'unite elle-meme
            const modifierUnit = findUnit(words[0]);
            if (modifierUnit) {
                return {
                    unit: modifierUnit.normalized,
                    remaining: words.slice(1).join(' ')
                };
            }
        }

        // Cherche une unite directement (sans modificateur)
        for (let len = Math.min(4, words.length); len >= 1; len--) {
            const candidate = words.slice(0, len).join(' ');
            const found = findUnit(candidate);
            if (found) {
                return {
                    unit: found.normalized,
                    remaining: words.slice(len).join(' ')
                };
            }
        }

        return {
            unit: null,
            remaining: text.trim()
        };
    }

    /**
     * Nettoie le nom d'un ingredient
     */
    function cleanIngredientName(name) {
        let cleaned = name
            .replace(/^\s*[-•·*]\s*/, '')           // Puces
            .replace(/^(de|du|des|le|la|les)\s+/i, '') // Articles au debut (avec espace)
            .replace(/^(d'|l')/i, '')               // Elisions (d'ail -> ail, l'huile -> huile)
            .replace(/@\w+/g, '')                   // @mentions
            .replace(/#\w+/g, '')                   // #hashtags
            .replace(/\([^)]*\)/g, '')              // Contenu entre parentheses (deja parse)
            .replace(/\s+/g, ' ')                   // Normalise espaces
            .trim();

        // Si le resultat est juste un article ou mot vide, retourne vide
        const emptyWords = ['le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'un', 'une', 'et', 'ou', 'the', 'a', 'an', 'and', 'or'];
        if (emptyWords.includes(cleaned.toLowerCase())) {
            return '';
        }

        return cleaned;
    }

    /**
     * Parse une ligne d'ingredient
     */
    function parseLine(line) {
        const originalLine = line.trim();
        if (!originalLine) return null;

        // Filtre le bruit
        if (isNoise(originalLine)) return null;

        // Nettoie les puces, tirets et emojis au debut
        const cleanedLine = originalLine
            .replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]+\s*/gu, '') // Emojis
            .replace(/^[•\-\*·]\s*/, '') // Puces
            .trim();
        if (!cleanedLine || cleanedLine.length < 2) return null;

        let quantity = null;
        let unit = null;
        let name = null;

        // Pattern special: "Ingredient (quantite)" ex: "Riz a risotto (200g)"
        const parenPattern = /^([^(]+)\s*\((\d+)\s*(g|kg|ml|cl|l)\)/i;
        const parenMatch = cleanedLine.match(parenPattern);
        if (parenMatch) {
            name = cleanIngredientName(parenMatch[1]);
            quantity = parseNumber(parenMatch[2]);
            unit = NORMALIZED_UNITS[normalizeText(parenMatch[3])] || parenMatch[3];
            if (name && name.length > 1) {
                return { name, quantity, unit };
            }
        }

        // Pattern principal: quantite au debut
        // Ex: "200g de farine", "2 gousses d'ail", "3 echalotes ciselees"
        const qtyPattern = /^(\d+[,.]?\d*|\d+\s*\/\s*\d+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|demi|demie)\s*(.*)$/i;
        const qtyMatch = cleanedLine.match(qtyPattern);

        if (qtyMatch) {
            quantity = parseNumber(qtyMatch[1]);
            let rest = qtyMatch[2].trim();

            if (rest) {
                // Essaie d'extraire une unite valide au debut du reste
                // On garde le "de" pour l'instant car il fait partie du pattern
                let restWithoutDe = rest.replace(/^(de|d'|du|des)\s+/i, '');

                // Essaie d'abord sans le "de"
                let { unit: foundUnit, remaining } = extractUnit(restWithoutDe);

                // Si pas trouve, essaie avec le texte original (cas ou "de" fait partie de l'ingredient)
                if (!foundUnit) {
                    const result = extractUnit(rest);
                    foundUnit = result.unit;
                    remaining = result.remaining;
                }

                if (foundUnit) {
                    unit = foundUnit;
                    // Enleve "de", "d'", etc. SEULEMENT au debut du nom, pas au milieu
                    name = cleanIngredientName(remaining.replace(/^(de|d'|du|des)\s+/i, ''));
                } else {
                    // Pas d'unite trouvee, tout est le nom de l'ingredient
                    unit = '';
                    // On utilise restWithoutDe car c'est probablement "Xg de farine" sans unite detectee
                    name = cleanIngredientName(restWithoutDe || rest);
                }
            }

            if (name && name.length > 1) {
                return { name, quantity, unit: unit || '' };
            }
        }

        // Pattern avec unite collee au nombre: "200g farine", "50cl lait"
        const gluedPattern = /^(\d+[,.]?\d*)(g|kg|mg|ml|cl|dl|l)\s+(.+)/i;
        const gluedMatch = cleanedLine.match(gluedPattern);
        if (gluedMatch) {
            quantity = parseNumber(gluedMatch[1]);
            unit = NORMALIZED_UNITS[normalizeText(gluedMatch[2])] || gluedMatch[2];
            name = cleanIngredientName(gluedMatch[3].replace(/^(de|d'|du|des)\s+/i, ''));
            if (name && name.length > 1) {
                return { name, quantity, unit };
            }
        }

        // Pattern: ligne qui commence par une unite (implique quantite = 1)
        // Ex: "pincée de sel", "gousse d'ail", "trait de citron"
        const unitFirstResult = extractUnit(cleanedLine);
        if (unitFirstResult.unit && unitFirstResult.remaining) {
            name = cleanIngredientName(unitFirstResult.remaining.replace(/^(de|d'|du|des)\s+/i, ''));
            if (name && name.length > 1) {
                return { name, quantity: 1, unit: unitFirstResult.unit };
            }
        }

        // Dernier recours: ligne qui ressemble a un ingredient simple sans quantite
        if (cleanedLine.length > 2 && cleanedLine.length < 50) {
            const normalized = normalizeText(cleanedLine);
            const foodWords = ['sel', 'poivre', 'huile', 'beurre', 'sucre', 'farine', 'oeuf', 'lait', 'creme', 'fromage', 'viande', 'poulet', 'poisson', 'legume', 'fruit', 'herbe', 'epice', 'ail', 'oignon', 'tomate', 'carotte', 'pomme', 'citron', 'orange', 'persil', 'basilic', 'thym', 'romarin', 'ciboulette', 'menthe', 'coriandre', 'aneth'];
            const hasFood = foodWords.some(word => normalized.includes(word));

            if (hasFood) {
                name = cleanIngredientName(cleanedLine);
                if (name && name.length > 1 && !isNoise(name)) {
                    return { name, quantity: null, unit: '' };
                }
            }
        }

        return null;
    }

    /**
     * Extrait la section ingredients d'un texte
     */
    function extractIngredientSection(text) {
        const normalized = normalizeText(text);

        // Cherche le debut de la section ingredients
        const startMarkers = [
            /ingredients?\s*:?/i,
            /il\s+(te|vous)\s+faut\s*:?/i,
            /liste\s*:?/i,
        ];

        // Cherche la fin de la section ingredients (debut des etapes)
        const endMarkers = [
            /etapes?\s*:?/i,
            /preparation\s*:?/i,
            /instructions?\s*:?/i,
            /recette\s*:?/i,
            /comment\s+faire/i,
            /marche\s+a\s+suivre/i,
        ];

        let startIndex = 0;
        let endIndex = text.length;

        // Trouve le debut
        for (const marker of startMarkers) {
            const match = normalized.match(marker);
            if (match) {
                const idx = normalized.indexOf(match[0]);
                if (idx !== -1) {
                    startIndex = idx + match[0].length;
                    break;
                }
            }
        }

        // Trouve la fin
        for (const marker of endMarkers) {
            const searchText = normalized.slice(startIndex);
            const match = searchText.match(marker);
            if (match) {
                const idx = searchText.indexOf(match[0]);
                if (idx !== -1 && idx > 20) { // Au moins 20 chars apres le debut
                    endIndex = startIndex + idx;
                    break;
                }
            }
        }

        return text.slice(startIndex, endIndex);
    }

    /**
     * Parse un texte complet et extrait les ingredients
     */
    function parseText(text) {
        const ingredients = [];
        const seen = new Set(); // Pour eviter les doublons

        // Extrait la section ingredients si possible
        const section = extractIngredientSection(text);

        // Separe par lignes
        const lines = section
            .split(/[\n\r]+/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        for (const line of lines) {
            const parsed = parseLine(line);
            if (parsed && parsed.name) {
                // Evite les doublons
                const key = normalizeText(parsed.name);
                if (!seen.has(key)) {
                    seen.add(key);
                    ingredients.push(parsed);
                }
            }
        }

        return ingredients;
    }

    /**
     * Detecte le nombre de portions dans un texte
     */
    function detectPortions(text) {
        const normalized = normalizeText(text);
        const match = normalized.match(/pour\s+(\d+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(personnes?|parts?|portions?)/);
        if (match) {
            const num = parseNumber(match[1]);
            return num || 4;
        }
        return null;
    }

    // API publique
    return {
        parse: parseText,
        parseLine: parseLine,
        detectPortions: detectPortions,
        parseNumber: parseNumber
    };
})();
