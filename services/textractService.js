const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const fs = require('fs');

class TextractService {
  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async extractText(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      console.log('File read completed');

      const textractStart = Date.now();
      console.log('Textract API call started at:', textractStart);
      
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: fileBuffer
        }
      });

      const response = await this.client.send(command);
      const textractEnd = Date.now();
      console.log('Textract API call completed at:', textractEnd);
      console.log('Textract API duration:', textractEnd - textractStart, 'ms');

      // Extract text
      const extractedText = response.Blocks
        .filter(block => block.BlockType === 'LINE')
        .map(block => block.Text)
        .join('\n');

      return {
        text: extractedText,
        timing: {
          start: textractStart,
          end: textractEnd,
          duration: textractEnd - textractStart
        }
      };
    } catch (error) {
      console.error('Error in Textract processing:', error);
      throw error;
    }
  }
}

module.exports = new TextractService(); 