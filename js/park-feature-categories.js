// Edit category colours here to update both feature layers and their legends.
window.PARK_FEATURE_CATEGORY_COLORS = {
    'Garden / planted': '#009E73',
    'Woodland & forest': '#117733',
    'Grass, grassland & meadow': '#44AA99',
    'Play areas': '#882255',
    'Pitches & playing fields': '#0072B2',
    'Scrub & heath': '#999933',
    'Other sports facilities': '#CC79A7',
    'Recreation ground / general parkland': '#56B4E9',
    'Golf': '#D55E00',
    'Allotments & community food growing': '#E69F00',
    'User specific green space': '#AA4499',
    'Other / unclassified': '#999999'
};

window.PARK_FEATURE_CATEGORY_ORDER = [
    'Garden / planted',
    'Woodland & forest',
    'Grass, grassland & meadow',
    'Play areas',
    'Pitches & playing fields',
    'Scrub & heath',
    'Other sports facilities',
    'Recreation ground / general parkland',
    'Golf',
    'Allotments & community food growing'
];

const PARK_FEATURE_PRIMARY_RULES = [
    ['Allotments & community food growing', ['allotments', 'community food growing', 'kitchen garden']],
    ['Garden / planted', ['garden', 'flowerbed', 'plant nursery', 'orchard', 'shrubs', 'shrubbery']],
    ['Other sports facilities', ['other sports facility', 'bowling green', 'tennis court', 'fitness station']],
    ['Golf', ['golf course', 'miniature golf']],
    ['Pitches & playing fields', ['pitch', 'playing field']],
    ['Woodland & forest', ['wood', 'forest']],
    ['Grass, grassland & meadow', ['grass', 'grassland', 'meadow']],
    ['Play areas', ['play space', 'playground']],
    ['Scrub & heath', ['scrub', 'heath']],
    ['Recreation ground / general parkland', ['recreation ground']]
];

const PARK_FEATURE_FALLBACK_RULES = [
    ['Woodland & forest', ['tree row', 'tree group']],
    ['Garden / planted', ['horticulture', 'public garden']],
    ['Grass, grassland & meadow', ['nature reserve']],
    ['Recreation ground / general parkland', ['park', 'common', 'village green']],
    ['User specific green space', ['religious', 'dog park', 'dogs']]
];

const PARK_FEATURE_EXCLUDE_TOKENS = new Set([
    'cemetery', 'farmland', 'farmyard', 'brownfield', 'construction',
    'commercial', 'industrial', 'retail', 'residential', 'outdoor seating',
    'water attenuation', 'water park', 'rock', 'hill', 'segway'
]);

window.categoriseParkFeature = function(value) {
    if (value === null || value === undefined) {
        return {
            name: 'Other / unclassified',
            color: window.PARK_FEATURE_CATEGORY_COLORS['Other / unclassified']
        };
    }

    const tokens = new Set(String(value).split(',').map(token =>
        token.trim().toLowerCase().replace(/_/g, ' ')
    ));

    for (const [category, keywords] of PARK_FEATURE_PRIMARY_RULES) {
        if (keywords.some(keyword => tokens.has(keyword))) {
            return { name: category, color: window.PARK_FEATURE_CATEGORY_COLORS[category] };
        }
    }

    for (const [category, keywords] of PARK_FEATURE_FALLBACK_RULES) {
        if (keywords.some(keyword => tokens.has(keyword))) {
            return { name: category, color: window.PARK_FEATURE_CATEGORY_COLORS[category] };
        }
    }

    if ([...tokens].every(token => PARK_FEATURE_EXCLUDE_TOKENS.has(token))) {
        return null;
    }

    return {
        name: 'Other / unclassified',
        color: window.PARK_FEATURE_CATEGORY_COLORS['Other / unclassified']
    };
};
