require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const textractService = require('./services/textractService');
const documentAiService = require('./services/documentAiService');
const azureVisionService = require('./services/azureVisionService');
const azureFormRecognizerService = require('./services/azureDocumentIntelligenceService');
const mistralAiService = require('./services/mistralAiService');
const { extractionPatterns } = require('./config');
const { processExtractedText } = require('./utils/textProcessor');

// Set Google Application Credentials - this tells Google's client libraries where to find credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'config', 'google-credentials.json');

// Debug logging middleware
const debugLogger = (req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] New request: ${req.method} ${req.path}`);
  req.requestId = requestId;
  next();
};

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Enable CORS and logging
app.use(cors({
  exposedHeaders: ['x-ocr-time']
}));
app.use(debugLogger);
app.use(express.json());

// Function to apply extraction patterns
const applyExtractionPatterns = (text) => {
  const results = {};
  extractionPatterns.forEach(pattern => {
    pattern.regex.lastIndex = 0; // Reset regex state
    const matches = pattern.regex.exec(text);
    results[pattern.name] = matches ? matches[1] : null;
  });
  return results;
};

// Function to process and send response
const processAndSendResponse = async (service, filePath, res, requestId) => {
  let result;
  let serviceName;

  switch (service) {
    case 'documentai':
      console.log(`[${requestId}] Processing with Google Document AI`);
      result = await documentAiService.extractText(filePath);
      serviceName = 'documentai';
      break;
    case 'azure':
      console.log(`[${requestId}] Processing with Azure Computer Vision`);
      result = await azureVisionService.extractText(filePath);
      serviceName = 'azure';
      break;
    case 'azureFormRecognizer':
      console.log(`[${requestId}] Processing with Azure Form Recognizer`);
      result = await azureFormRecognizerService.extractText(filePath);
      serviceName = 'azureFormRecognizer';
      break;
    case 'mistral':
      console.log(`[${requestId}] Processing with Mistral AI`);
      result = await mistralAiService.extractText(filePath);
      serviceName = 'mistral';
      break;
    default:
      console.log(`[${requestId}] Processing with Textract`);
      result = await textractService.extractText(filePath);
      serviceName = 'textract';
  }
  
  // Process the extracted text
  const { fixedText, extractedData, majorityDecimalCount } = processExtractedText(result.text);
  
  const response = {
    status: 'COMPLETED',
    result: fixedText,
    extractedData,
    majorityDecimalCount,
    service: serviceName
  };

  console.log(`[${requestId}] Response to be sent:`, JSON.stringify(response, null, 2));
  
  res.setHeader('x-ocr-time', result.timing.duration);
  res.json(response);
};

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const requestId = req.requestId;
  console.log(`[${requestId}] === Processing Upload Request ===`);
  console.log(`[${requestId}] Service: ${req.query.service || 'textract'}`);
  
  try {
    if (!req.file) {
      console.log(`[${requestId}] Error: No file uploaded`);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[${requestId}] File received:`, {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const service = req.query.service?.toLowerCase();
    const filePath = req.file.path;

    await processAndSendResponse(service, filePath, res, requestId);

  } catch (error) {
    console.error(`[${requestId}] Error processing file:`, error);
    res.status(500).json({ error: error.message });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(`[${requestId}] Error deleting temporary file:`, err);
        else console.log(`[${requestId}] Temporary file deleted successfully`);
      });
    }
    console.log(`[${requestId}] === Request Processing Complete ===\n`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 