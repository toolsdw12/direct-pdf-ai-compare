const { Mistral } = require('@mistralai/mistralai');
const fs = require('fs');

class MistralService {
    constructor() {
        this.client = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY
        });
    }

    async extractText(filePath) {
        try {
            // Read the PDF file
            const fileContent = fs.readFileSync(filePath);
            
            // Upload the file to Mistral
            const uploadedFile = await this.client.files.upload({
                file: {
                    fileName: "document.pdf",
                    content: fileContent,
                },
                purpose: "ocr"
            });

            // Get signed URL for the uploaded file
            const signedUrl = await this.client.files.getSignedUrl({
                fileId: uploadedFile.id,
            });

            // Start timing the actual OCR processing
            const startTime = Date.now();
            console.log('Mistral OCR API call started at:', startTime);

            // Process the document with OCR
            const ocrResponse = await this.client.ocr.process({
                model: "mistral-ocr-latest",
                document: {
                    type: "document_url",
                    documentUrl: signedUrl.url,
                },
                includeImageBase64: true // Include images if present in the document
            });

            const endTime = Date.now();
            console.log('Mistral OCR API call completed at:', endTime);
            console.log('Mistral OCR API duration:', endTime - startTime, 'ms');

            // Log the OCR response for debugging
            console.log('Mistral OCR Response:', JSON.stringify(ocrResponse, null, 2));

            // Extract text and metadata from OCR response
            let result = {
                text: '',
                metadata: {
                    pages: [],
                    totalPages: 0,
                    documentInfo: {}
                }
            };
            
            // Handle the Mistral OCR response structure
            if (ocrResponse && Array.isArray(ocrResponse.pages)) {
                // Get total pages
                result.metadata.totalPages = ocrResponse.pages.length;

                // Process each page
                ocrResponse.pages.sort((a, b) => a.index - b.index); // Ensure pages are in order
                
                result.text = ocrResponse.pages
                    .map(page => page.markdown || '')
                    .join('\n\n');

                // Store page metadata
                result.metadata.pages = ocrResponse.pages.map(page => ({
                    index: page.index,
                    dimensions: page.dimensions,
                    hasImages: Array.isArray(page.images) && page.images.length > 0
                }));
            }

            // Add usage info if available
            if (ocrResponse.usageInfo) {
                result.metadata.documentInfo = {
                    pagesProcessed: ocrResponse.usageInfo.pagesProcessed,
                    docSizeBytes: ocrResponse.usageInfo.docSizeBytes,
                    model: ocrResponse.model
                };
            }

            // If no text was extracted, throw an error
            if (!result.text) {
                console.error('No text content found in OCR response:', ocrResponse);
                throw new Error('No text content found in OCR response');
            }

            return {
                ...result,
                timing: {
                    start: startTime,
                    end: endTime,
                    duration: endTime - startTime
                }
            };
        } catch (error) {
            console.error('Mistral OCR Error:', error);
            throw error;
        }
    }

    // Optional: Add method for document understanding/Q&A
    async askDocument(filePath, question) {
        try {
            const fileContent = fs.readFileSync(filePath);
            
            const uploadedFile = await this.client.files.upload({
                file: {
                    fileName: "document.pdf",
                    content: fileContent,
                },
                purpose: "ocr"
            });

            const signedUrl = await this.client.files.getSignedUrl({
                fileId: uploadedFile.id,
            });

            const chatResponse = await this.client.chat.complete({
                model: "mistral-small-latest",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: question
                            },
                            {
                                type: "document_url",
                                documentUrl: signedUrl.url
                            }
                        ]
                    }
                ]
            });

            return chatResponse.choices[0].message.content;
        } catch (error) {
            console.error('Document Q&A Error:', error);
            throw error;
        }
    }
}

module.exports = new MistralService(); 