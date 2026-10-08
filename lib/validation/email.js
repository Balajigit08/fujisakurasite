// Common misspelled domains that users accidentally type
const INVALID_TYPO_DOMAINS = new Set([
    "gail.com", "gmial.com", "gamil.com", "gmaill.com", "gmai.com", "gmal.com", "gmail.co",
    "yaho.com", "yahooo.com", "yahu.com", "yaho.co",
    "hotmial.com", "hotmai.com", "hotmle.com", "hotmale.com",
    "outlok.com", "outloo.com", "outlock.com",
    "iclud.com", "icoud.com"
]);

/**
 * Validates email address syntax strictly against RFC standards
 * and blocks common typo domains (e.g. gail.com instead of gmail.com).
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (!email || typeof email !== "string") return false;
    const trimmed = email.trim();
    if (trimmed.length < 5 || trimmed.length > 100) return false;

    // Must contain exactly one '@' symbol
    const parts = trimmed.split("@");
    if (parts.length !== 2) return false;

    const [local, domain] = parts;

    // Local part constraints: 1-64 chars, cannot start/end with dot, no consecutive dots
    if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
        return false;
    }

    // Local part must contain at least one letter or digit
    if (!/[a-zA-Z0-9]/.test(local)) {
        return false;
    }

    // Local part must start and end with an alphanumeric character
    if (!/^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(local) && local.length > 1) {
        return false;
    }
    if (local.length === 1 && !/^[a-zA-Z0-9]$/.test(local)) {
        return false;
    }

    // Allowed characters in local part: only alphanumeric, dot, underscore, hyphen, plus, percent
    if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) {
        return false;
    }

    // Domain part constraints: 3-255 chars, cannot start/end with dot or hyphen, no consecutive dots
    if (!domain || domain.length < 3 || domain.length > 255 || domain.startsWith(".") || domain.endsWith(".") || domain.startsWith("-") || domain.endsWith("-") || domain.includes("..")) {
        return false;
    }

    // Domain must have at least one period separating labels
    const labels = domain.split(".");
    if (labels.length < 2) return false;

    for (const label of labels) {
        if (!label || label.length > 63 || label.startsWith("-") || label.endsWith("-")) {
            return false;
        }
        // Domain label characters: only alphanumeric and hyphens (NO symbols like #, $, %, etc.)
        if (!/^[a-zA-Z0-9-]+$/.test(label)) {
            return false;
        }
    }

    // Top-Level Domain (TLD) must be at least 2 alphabetic characters
    const tld = labels[labels.length - 1];
    if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
        return false;
    }

    // Reject known common typo domains (e.g. gail.com, gmial.com, etc.)
    if (INVALID_TYPO_DOMAINS.has(domain.toLowerCase())) {
        return false;
    }

    return true;
}
