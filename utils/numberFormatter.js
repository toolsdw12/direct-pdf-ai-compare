/**
 * Gets the most common number of decimal places in the text
 * @param {string} data - The text to analyze
 * @returns {number} The majority decimal count
 */
const getMajorityDecimalCount = (data) => {
  const counts = (data.match(/^\s*\d{1,3}(?:,\d{3})*(?:\.(\d+))?\s*$/gm) || [])
    .map(x => (x.match(/\.(\d+)/)?.[1]?.length || 0));
  
  // If no decimal numbers found, return 0
  if (counts.length === 0) {
    return 0;
  }

  // Count occurrences of each decimal place count
  const countMap = counts.reduce((a, c) => (a[c] = -(~a[c]), a), {});
  
  // Find the most common decimal place count
  return Object.entries(countMap)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

/**
 * Fixes malformed numbers in text by normalizing decimal and thousand separators
 * @param {string} text - The text containing numbers to fix
 * @param {string} decimalPlaces - Number of decimal places to keep (default: "2")
 * @returns {string} Text with normalized numbers
 */
const fixInvalidNumbers = (text, decimalPlaces = "2") => {
  return text.replace(/\b\d+(?:[.,]\d+){1,}\b/g, match => {
    const parts = match.split(/[.,]/);
    if (decimalPlaces === "0") {
      return parts.join(','); // Replace all dots with commas
    }
    return parts.slice(0, -1).join(',') + '.' + parts.at(-1).slice(0, decimalPlaces);
  });
};

module.exports = {
  getMajorityDecimalCount,
  fixInvalidNumbers
}; 