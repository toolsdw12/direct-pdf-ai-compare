const { DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
const { AzureKeyCredential } = require('@azure/core-auth');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from a document using Azure Form Recognizer Read Model
 * @param {string} filePath - Path to the document file
 * @returns {Promise<{text: string, timing: {start: number, end: number, duration: number}}>}
 */
async function extractText(filePath) {
  console.log('Extracting text using Azure Form Recognizer Read Model');
  const startTime = Date.now();

  try {
    // Create credentials and client
    const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    
    if (!key || !endpoint) {
      throw new Error('Azure Form Recognizer credentials not configured');
    }

    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Start the document analysis operation
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-read",
      fileBuffer
    );
    
    // Wait for the operation to complete
    const result = await poller.pollUntilDone();
    
    // Extract text from the result
    let extractedText = '';
    
    if (result.pages) {
      for (const page of result.pages) {
        if (page.lines) {
          const lines = page.lines.map(line => line.content);
          extractedText += lines.join('\n') + '\n\n';
        }
      }
    }
    
    const endTime = Date.now();
    
    return {
      text: extractedText,
      timing: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime
      }
    };
  } catch (error) {
    console.error('Error in Azure Form Recognizer Service:', error);
    throw error;
  }
}

module.exports = {
  extractText
}; 