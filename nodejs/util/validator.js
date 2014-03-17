exports.alphaNumericPattern = /^[A-Za-z0-9]+$/;

/**
 * Validate the string 'str' against the regex pattern.
 * @param str - the string object being validated
 * @param pattern - regex to test against
 * @param isNullPermitted - true/false
 * @param maxLength - maximum allowable length for str.
 * @returns True if str is valid, false otherwise.
 */
exports.validate = function(str, pattern, isNullPermitted, maxLength) {
    if (!str) return isNullPermitted;
    if (str.length > maxLength) return false;
    return pattern.test(str);
}