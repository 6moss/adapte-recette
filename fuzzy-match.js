/**
 * Module de fuzzy matching pour la détection d'ingrédients
 * Permet de tolérer les fautes de frappe courantes
 */

const FuzzyMatch = (function() {
    'use strict';

    // ==================== TYPOS PRÉ-CALCULÉS ====================
    // Mapping des fautes de frappe courantes vers les formes correctes
    const COMMON_TYPOS = {
        // --- Transpositions ---
        'farnie': 'farine',
        'farine': 'farine',
        'slue': 'sel',
        'sle': 'sel',
        'sucr': 'sucre',
        'scure': 'sucre',
        'beurr': 'beurre',
        'buerre': 'beurre',
        'oeufs': 'oeuf',
        'ouefs': 'oeuf',

        // --- Lettres manquantes ---
        'farin': 'farine',
        'levue': 'levure',
        'levur': 'levure',
        'papika': 'paprika',
        'paprik': 'paprika',
        'curcma': 'curcuma',
        'curcum': 'curcuma',
        'coriandre': 'coriandre',
        'coriande': 'coriandre',
        'basilc': 'basilic',
        'baslic': 'basilic',
        'romarn': 'romarin',
        'romari': 'romarin',
        'persil': 'persil',
        'persl': 'persil',
        'thm': 'thym',
        'thy': 'thym',
        'oregano': 'oregano',
        'oregan': 'oregano',
        'laurer': 'laurier',
        'laurie': 'laurier',

        // --- Lettres en trop ---
        'farrine': 'farine',
        'farinne': 'farine',
        'sellll': 'sel',
        'seell': 'sel',
        'poivree': 'poivre',
        'poivvre': 'poivre',
        'sucree': 'sucre',
        'beurrre': 'beurre',
        'cannellle': 'cannelle',
        'vanillle': 'vanille',

        // --- Erreurs phonétiques françaises ---
        'canelle': 'cannelle',
        'canele': 'cannelle',
        'vanile': 'vanille',
        'vanyle': 'vanille',
        'creme': 'crème',
        'créme': 'crème',
        'echalotte': 'echalote',
        'echallote': 'echalote',
        'échallote': 'échalote',
        'muscad': 'muscade',
        'muscadde': 'muscade',
        'cardamone': 'cardamome',
        'cardamomme': 'cardamome',
        'gingembre': 'gingembre',
        'gingenbre': 'gingembre',
        'gingembre': 'gingembre',

        // --- Confusions de lettres ---
        'cumun': 'cumin',
        'cunim': 'cumin',
        'curri': 'curry',
        'cury': 'curry',
        'currry': 'curry',
        'thime': 'thym',
        'tyme': 'thyme',
        'basilique': 'basilic',
        'bazilique': 'basilic',
        'origan': 'origan',
        'origano': 'origan',
        'estragonn': 'estragon',
        'estragone': 'estragon',

        // --- Accents mal placés ---
        'épice': 'epice',
        'epices': 'epices',
        'épicés': 'epices',
        'herbes': 'herbes',
        'hèrbes': 'herbes',

        // --- Confusions doubles consonnes ---
        'papper': 'pepper',
        'peeper': 'pepper',
        'cinnamon': 'cinnamon',
        'cinamon': 'cinnamon',
        'cinnammon': 'cinnamon',
        'oreganno': 'oregano',
        'basill': 'basil',
        'bazil': 'basil',
        'parsely': 'parsley',
        'parsly': 'parsley',
        'parslei': 'parsley',
        'rosemery': 'rosemary',
        'rosemarie': 'rosemary',
        'rosmarry': 'rosemary',

        // --- Levures ---
        'levur': 'levure',
        'levurre': 'levure',
        'levuree': 'levure',
        'yeast': 'yeast',
        'yiest': 'yeast',
        'yeest': 'yeast',
        'bicarbonatte': 'bicarbonate',
        'bicarbonnat': 'bicarbonate',
        'bicarbonat': 'bicarbonate',
        'baking powde': 'baking powder',
        'bakingpowder': 'baking powder',
        'baking sod': 'baking soda',
        'bakingsoda': 'baking soda',

        // --- Huiles et graisses ---
        'huil': 'huile',
        'huille': 'huile',
        'huillle': 'huile',
        'oile': 'oil',
        'oill': 'oil',
        'butte': 'butter',
        'buttr': 'butter',
        'buttter': 'butter',
        'graiss': 'graisse',
        'graisse': 'graisse',
        'graissse': 'graisse',
        'saindou': 'saindoux',
        'sainddoux': 'saindoux',

        // --- Alliacées ---
        'ails': 'ail',
        'aill': 'ail',
        'garlicc': 'garlic',
        'garlick': 'garlic',
        'oignion': 'oignon',
        'oignons': 'oignon',
        'oinion': 'onion',
        'onione': 'onion',
        'echalot': 'echalote',
        'shalot': 'shallot',
        'shalott': 'shallot',
        'challot': 'shallot',
        'poirreau': 'poireau',
        'poireaux': 'poireau',
        'leeck': 'leek',
        'leaks': 'leek',

        // --- Herbes supplémentaires ---
        'ciboullete': 'ciboulette',
        'ciboulete': 'ciboulette',
        'chive': 'chives',
        'chivs': 'chives',
        'anett': 'aneth',
        'dil': 'dill',
        'dilll': 'dill',
        'mentha': 'menthe',
        'menth': 'menthe',
        'minte': 'mint',
        'mintt': 'mint',
        'sauge': 'sauge',
        'sage': 'sage',
        'sagee': 'sage',
        'cerfueil': 'cerfeuil',
        'cerveuil': 'cerfeuil',
        'marjolain': 'marjolaine',
        'marjoram': 'marjoram',
        'marjoran': 'marjoram',

        // --- Épices asiatiques ---
        'gochujang': 'gochujang',
        'gochugang': 'gochujang',
        'gochugaru': 'gochugaru',
        'gochugari': 'gochugaru',
        'sriracha': 'sriracha',
        'siracha': 'sriracha',
        'sriratcha': 'sriracha',
        'wasab': 'wasabi',
        'wassabi': 'wasabi',
        'nuocmam': 'nuoc mam',
        'nuocnam': 'nuoc mam',
        'fishsauce': 'fish sauce',
        'soysauce': 'soy sauce',
        'soysausce': 'soy sauce',

        // --- Mélanges d'épices ---
        'garammasala': 'garam masala',
        'garam masla': 'garam masala',
        'ras el hanoot': 'ras el hanout',
        'raselhanout': 'ras el hanout',
        'zaatar': 'za\'atar',
        'zatar': 'za\'atar',
        'zaa\'tar': 'za\'atar',
        'sumak': 'sumac',
        'sumack': 'sumac',

        // --- Condiments ---
        'moutard': 'moutarde',
        'moutardde': 'moutarde',
        'mustar': 'mustard',
        'musterd': 'mustard',
        'vinaigr': 'vinaigre',
        'vinagar': 'vinegar',
        'vineger': 'vinegar',
        'worcesterchire': 'worcestershire',
        'worchestershire': 'worcestershire',
        'worcesteshire': 'worcestershire'
    };

    /**
     * Calcule la distance de Levenshtein entre deux chaînes
     * Optimisé avec early termination
     * @param {string} s1 - Première chaîne
     * @param {string} s2 - Deuxième chaîne
     * @param {number} maxDistance - Distance maximale acceptée
     * @returns {number} Distance de Levenshtein
     */
    function levenshteinDistance(s1, s2, maxDistance) {
        // Early termination si différence de longueur trop grande
        if (Math.abs(s1.length - s2.length) > maxDistance) {
            return maxDistance + 1;
        }

        // Utiliser la chaîne la plus courte comme s1 pour optimiser la mémoire
        if (s1.length > s2.length) {
            [s1, s2] = [s2, s1];
        }

        const len1 = s1.length;
        const len2 = s2.length;

        // Optimisation: une seule ligne de mémoire
        let prevRow = new Array(len1 + 1);
        let currRow = new Array(len1 + 1);

        // Initialiser la première ligne
        for (let i = 0; i <= len1; i++) {
            prevRow[i] = i;
        }

        // Remplir la matrice avec early termination
        for (let j = 1; j <= len2; j++) {
            currRow[0] = j;
            let minInRow = j;

            for (let i = 1; i <= len1; i++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                currRow[i] = Math.min(
                    prevRow[i] + 1,      // suppression
                    currRow[i - 1] + 1,  // insertion
                    prevRow[i - 1] + cost // substitution
                );
                minInRow = Math.min(minInRow, currRow[i]);
            }

            // Early termination si minimum dépasse le seuil
            if (minInRow > maxDistance) {
                return maxDistance + 1;
            }

            [prevRow, currRow] = [currRow, prevRow];
        }

        return prevRow[len1];
    }

    /**
     * Retourne le seuil de distance adaptatif selon la longueur du mot
     * Plus conservateur pour éviter les faux positifs
     * @param {number} wordLength - Longueur du mot
     * @returns {number} Seuil de distance maximale
     */
    function getThreshold(wordLength) {
        if (wordLength <= 3) return 0;      // "sel", "ail" -> PAS de fuzzy, exact seulement
        if (wordLength <= 4) return 1;      // "thym" -> distance 1 max
        if (wordLength <= 6) return 1;      // "cumin" -> distance 1 max
        if (wordLength <= 8) return 2;      // "cannelle" -> distance 2 max
        return Math.min(2, Math.floor(wordLength / 4)); // Mots plus longs: ~25% de tolérance max
    }

    /**
     * Normalise le texte pour la comparaison (supprime accents, minuscules)
     * @param {string} text - Texte à normaliser
     * @returns {string} Texte normalisé
     */
    function normalize(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['']/g, ' ')
            .replace(/[œ]/g, 'oe')
            .replace(/[æ]/g, 'ae')
            .trim();
    }

    /**
     * Échappe les caractères spéciaux pour les regex
     * @param {string} string - Chaîne à échapper
     * @returns {string} Chaîne échappée
     */
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Vérifie si un mot-clé est un mot distinct dans le nom d'ingrédient
     * Évite que "sel" matche dans "persil" ou "ail" dans "taillé"
     * @param {string} keyword - Mot-clé à chercher
     * @param {string} ingredientName - Nom de l'ingrédient
     * @returns {boolean} True si le mot-clé est distinct
     */
    function matchWithWordBoundaries(keyword, ingredientName) {
        const normalizedKeyword = normalize(keyword);
        const normalizedName = normalize(ingredientName);

        // Pour les mots très courts (1-3 chars comme "sel", "ail"), être très strict
        // Ils doivent être au début/fin du texte ou entourés d'espaces
        if (normalizedKeyword.length <= 3) {
            // Exact match ou mot séparé par espaces/début/fin
            const pattern = new RegExp(`(^|\\s)${escapeRegex(normalizedKeyword)}($|\\s|,|;|\\.|!|\\?)`);
            return pattern.test(normalizedName);
        }

        // Pour les mots de 4+ chars, utiliser les word boundaries standard
        // mais vérifier que ce n'est pas un sous-mot d'un mot plus long
        const words = normalizedName.split(/\s+/);
        for (const word of words) {
            // Le mot-clé doit être soit le mot complet, soit le début/fin du mot
            if (word === normalizedKeyword) {
                return true;
            }
            // Pour les mots composés: "poivre-noir" -> accepter "poivre"
            if (word.startsWith(normalizedKeyword + '-') || word.endsWith('-' + normalizedKeyword)) {
                return true;
            }
        }

        // Fallback: pattern avec word boundaries mais seulement si pas au milieu d'un mot
        const pattern = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`);
        if (pattern.test(normalizedName)) {
            // Vérifier que ce n'est pas un faux positif
            // Ex: "ail" dans "taillé" - le pattern \b matche car "ail" est après "t" qui est une lettre
            // On vérifie que le caractère avant n'est pas une lettre
            const index = normalizedName.indexOf(normalizedKeyword);
            if (index > 0) {
                const charBefore = normalizedName[index - 1];
                if (/[a-z]/.test(charBefore)) {
                    return false; // Faux positif: le keyword est au milieu d'un mot
                }
            }
            return true;
        }

        return false;
    }

    /**
     * Trouve la meilleure correspondance dans une liste de candidats
     * Utilise une approche en couches pour optimiser les performances
     * @param {string} input - Texte d'entrée
     * @param {string[]} candidates - Liste de candidats
     * @returns {Object|null} Résultat avec match, distance, confidence, method
     */
    function findBestMatch(input, candidates) {
        if (!input || !candidates || candidates.length === 0) {
            return null;
        }

        const normalizedInput = normalize(input);
        if (normalizedInput.length < 2) return null;

        // Couche 1: Vérifier les typos pré-calculés (O(1))
        if (COMMON_TYPOS[normalizedInput]) {
            const corrected = COMMON_TYPOS[normalizedInput];
            // Vérifier si la forme corrigée est dans les candidats
            for (const candidate of candidates) {
                if (normalize(candidate) === normalize(corrected)) {
                    return {
                        match: candidate,
                        distance: 0,
                        confidence: 1.0,
                        method: 'typo-map'
                    };
                }
            }
        }

        // Couche 2: Match exact après normalisation
        for (const candidate of candidates) {
            const normalizedCandidate = normalize(candidate);
            if (normalizedInput === normalizedCandidate) {
                return {
                    match: candidate,
                    distance: 0,
                    confidence: 1.0,
                    method: 'exact'
                };
            }
        }

        // Couche 3: Match avec word boundaries
        for (const candidate of candidates) {
            if (matchWithWordBoundaries(candidate, input)) {
                return {
                    match: candidate,
                    distance: 0,
                    confidence: 0.95,
                    method: 'word-boundary'
                };
            }
        }

        // Couche 4: Fuzzy match avec Levenshtein (plus lent)
        const threshold = getThreshold(normalizedInput.length);
        let bestMatch = null;
        let bestDistance = threshold + 1;

        for (const candidate of candidates) {
            const normalizedCandidate = normalize(candidate);

            // Skip si différence de longueur trop grande
            if (Math.abs(normalizedInput.length - normalizedCandidate.length) > threshold) {
                continue;
            }

            const distance = levenshteinDistance(
                normalizedInput,
                normalizedCandidate,
                threshold
            );

            if (distance <= threshold && distance < bestDistance) {
                bestDistance = distance;
                bestMatch = candidate;
            }
        }

        if (bestMatch) {
            // La confiance diminue avec la distance
            const confidence = 1 - (bestDistance / (threshold + 1)) * 0.4;
            return {
                match: bestMatch,
                distance: bestDistance,
                confidence: confidence,
                method: 'levenshtein'
            };
        }

        return null;
    }

    /**
     * Vérifie si un ingrédient appartient à une catégorie avec tolérance aux typos
     * @param {string} ingredientName - Nom de l'ingrédient
     * @param {string[]} categoryKeywords - Mots-clés de la catégorie
     * @returns {boolean} True si l'ingrédient appartient à la catégorie
     */
    function belongsToCategory(ingredientName, categoryKeywords) {
        if (!ingredientName) return false;

        // Extraire les mots individuels de l'ingrédient
        const words = normalize(ingredientName).split(/\s+/);

        // Vérifier d'abord avec les word boundaries (rapide)
        for (const keyword of categoryKeywords) {
            if (matchWithWordBoundaries(keyword, ingredientName)) {
                return true;
            }
        }

        // Puis essayer le fuzzy matching sur chaque mot (plus lent)
        // Seulement pour les mots de 4+ caractères pour éviter les faux positifs
        for (const word of words) {
            if (word.length < 4) continue; // Ignorer les mots courts (sel, ail, etc.)

            const result = findBestMatch(word, categoryKeywords);
            if (result && result.confidence >= 0.75) { // Seuil plus strict
                return true;
            }
        }

        return false;
    }

    // API publique
    return {
        findBestMatch,
        matchWithWordBoundaries,
        belongsToCategory,
        levenshteinDistance,
        normalize,
        getThreshold,
        COMMON_TYPOS
    };
})();

// Export pour utilisation dans app.js
if (typeof window !== 'undefined') {
    window.FuzzyMatch = FuzzyMatch;
}
