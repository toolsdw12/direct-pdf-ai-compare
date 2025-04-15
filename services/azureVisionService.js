const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file using Azure Computer Vision Read API
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, timing: {start: number, end: number, duration: number}}>}
 */
async function extractText(filePath) {
  console.log('Extracting text using Azure Computer Vision Read API');
  const startTime = Date.now();

  try {
    // Create credentials and client
    const key = process.env.AZURE_COMPUTER_VISION_KEY;
    const endpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT;
    
    if (!key || !endpoint) {
      throw new Error('Azure Computer Vision credentials not configured');
    }

    const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
    const client = new ComputerVisionClient(credentials, endpoint);

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Start the read operation
    const readOperation = await client.readInStream(fileBuffer);
    
    // Get operation ID from response
    const operationId = readOperation.operationLocation.split('/').pop();
    
    // Poll for the results
    let result;
    let status = '';
    
    console.log('Waiting for Azure to process the document...');
    
    // Poll until the operation completes
    while (status !== 'succeeded' && status !== 'failed') {
      result = await client.getReadResult(operationId);
      status = result.status;
      
      if (status === 'notStarted' || status === 'running') {
        console.log(`Azure Read operation status: ${status}. Waiting 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (status === 'failed') {
      throw new Error('Azure Read operation failed');
    }
    
    // Extract text from the result
    let extractedText = '';
    
    if (result.analyzeResult && result.analyzeResult.readResults) {
      for (const page of result.analyzeResult.readResults) {
        for (const line of page.lines || []) {
          extractedText += line.text + '\n';
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
    console.error('Error in Azure Vision Service:', error);
    throw error;
  }
}

module.exports = {
  extractText
}; 