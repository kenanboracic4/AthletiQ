const ROLE_TO_AD_TYPE = {
    klub: 'club',
    club: 'club',
    trener: 'coach',
    coach: 'coach',
    skaut: 'scout',
    scout: 'scout',
    sportista: 'athlete',
    athlete: 'athlete',
};

const ROLE_VALUE_TO_TOKEN = {
    Klub: 'club',
    Trener: 'coach',
    Skaut: 'scout',
    Sportista: 'athlete',
    'Rekreativni sportista': 'recreational_athlete',
};

const TARGET_TO_API = {
    club: 'Klub',
    coach: 'Trener',
    scout: 'Skaut',
    athlete: 'Sportista',
    recreational_athlete: 'Rekreativni sportista',
};

export function roleToAdType(role) {
    if (!role) return null;
    return ROLE_TO_AD_TYPE[role.toLowerCase()] ?? null;
}

export function roleToToken(role) {
    if (!role) return '';
    return ROLE_VALUE_TO_TOKEN[role] ?? ROLE_TO_AD_TYPE[role.toLowerCase()] ?? role.toLowerCase();
}

export function targetRoleToApi(targetRole) {
    if (!targetRole) return null;
    return TARGET_TO_API[targetRole] ?? null;
}
