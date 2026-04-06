"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaignCreationBlockers = getCampaignCreationBlockers;
exports.isProfileCompleteForCampaignCreation = isProfileCompleteForCampaignCreation;
const MIN_BIO_LENGTH = 30;
function isValidHttpUrl(value) {
    if (!value?.trim())
        return false;
    try {
        const u = new URL(value.trim());
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch {
        return false;
    }
}
function getCampaignCreationBlockers(profile) {
    const missing = [];
    if (!profile.bio?.trim() || profile.bio.trim().length < MIN_BIO_LENGTH) {
        missing.push(`biografía (mínimo ${MIN_BIO_LENGTH} caracteres)`);
    }
    if (!profile.companyName?.trim() || profile.companyName.trim().length < 2) {
        missing.push('nombre de empresa o proyecto');
    }
    if (!isValidHttpUrl(profile.website)) {
        missing.push('sitio web válido (https://…)');
    }
    if (!isValidHttpUrl(profile.linkedinUrl)) {
        missing.push('URL de LinkedIn válida (https://…)');
    }
    if (!profile.country?.trim()) {
        missing.push('país');
    }
    return missing;
}
function isProfileCompleteForCampaignCreation(profile) {
    return getCampaignCreationBlockers(profile).length === 0;
}
//# sourceMappingURL=campaign-profile-eligibility.js.map