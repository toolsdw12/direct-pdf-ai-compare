const { getMajorityDecimalCount, fixInvalidNumbers } = require('./numberFormatter');
const { extractionPatterns } = require('../config');

/**
 * Processes extracted text by fixing numbers and applying extraction patterns
 * @param {string} text - The raw text extracted from the document
 * @returns {Object} Processed text and extracted data
 */
const processExtractedText = (text) => {
  // Get majority decimal count and fix numbers
  const majorityDecimalCount = getMajorityDecimalCount(text);

  //const fixedText = fixInvalidNumbers(text, majorityDecimalCount.toString());
  const fixedText = text;
  
  // Apply extraction patterns
  const extractedData = {};
  extractionPatterns.forEach(pattern => {
    pattern.regex.lastIndex = 0; // Reset regex state
    const matches = pattern.regex.exec(fixedText);
    extractedData[pattern.name] = matches ? matches[1] : null;
  });

  return {
    fixedText,
    extractedData,
    majorityDecimalCount
  };
};

module.exports = {
  processExtractedText
}; 