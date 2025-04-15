const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const fs = require('fs');
const path = require('path');

class DocumentAiService {
    constructor() {
        // Load credentials directly from the file
        const credentialsPath = path.join(__dirname, '..', 'config', 'google-credentials.json');
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        
        // Initialize Document AI client with explicit credentials
        this.client = new DocumentProcessorServiceClient({
            credentials: credentials,
            projectId: credentials.project_id
        });
        
        // Set your processor details
        this.projectId = process.env.GOOGLE_PROJECT_ID || credentials.project_id;
        this.location = process.env.GOOGLE_LOCATION || 'us';
        this.processorId = process.env.GOOGLE_PROCESSOR_ID;
    }

    async extractText(filePath) {
        const startTime = Date.now();
        console.log('Starting Document AI processing...');
        console.log(`Project ID: ${this.projectId}`);
        console.log(`Location: ${this.location}`);
        console.log(`Processor ID: ${this.processorId}`);

        try {
            // Check if the processor ID already contains the full path
            let name;
            if (this.processorId.includes('projects/')) {
                name = this.processorId;
            } else {
                name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;
            }
            console.log(`Full processor path: ${name}`);
            
            // Read the file into memory
            const imageFile = fs.readFileSync(filePath);
            console.log(`File read successfully, size: ${imageFile.length} bytes`);
            
            // Create the request
            const request = {
                name,
                rawDocument: {
                    content: imageFile,
                    mimeType: 'application/pdf',
                },
            };

            console.log('Sending request to Document AI...');
            // Process document
            const [result] = await this.client.processDocument(request);
            console.log('Document AI processing completed successfully');
            
            const { document } = result;

            // Get all text from the document
            const text = document.text;
            console.log(`Extracted text length: ${text.length} characters`);

            const endTime = Date.now();
            console.log(`Document AI processing time: ${endTime - startTime}ms`);
            
            return {
                text,
                timing: {
                    start: startTime,
                    end: endTime,
                    duration: endTime - startTime
                }
            };
        } catch (error) {
            console.error('Error in Document AI processing:', error);
            // More detailed error logging
            if (error.details) {
                console.error('Error details:', error.details);
            }
            if (error.code) {
                console.error('Error code:', error.code);
            }
            throw error;
        }
    }
}

module.exports = new DocumentAiService(); 