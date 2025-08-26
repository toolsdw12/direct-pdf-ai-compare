import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import AnthropicAiService from './services/anthropicAiService.js';
import OpenAiService from './services/openAiService.js';
import GoogleGenAIService from './services/googleGenAI.js';
import { AI_MODELS, getDefaultModel, getAllModels, getModelInfo } from './config/models.js';

// Clean up leftover PDFs on startup
const cleanupUploadsDirectory = () => {
  const uploadsDir = 'uploads';
  if (fs.existsSync(uploadsDir)) {
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        console.error('Error reading uploads directory on startup:', err);
      } else {
        files.forEach(file => {
          const filePath = path.join(uploadsDir, file);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Error deleting leftover file ${file}:`, unlinkErr);
            } else {
              console.log(`Leftover file ${file} deleted on startup`);
            }
          });
        });
        console.log(`Cleaned up ${files.length} leftover files from uploads directory`);
      }
    });
  }
};

// Clean up on startup
cleanupUploadsDirectory();

// Initialize AI services
const anthropicService = new AnthropicAiService();
const openAiService = new OpenAiService();
const googleGenAIService = new GoogleGenAIService();

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
app.use(cors());
app.use(debugLogger);
app.use(express.json());

// Models endpoint
app.get('/models', (req, res) => {
  try {
    const models = {
      providers: AI_MODELS.providers,
      defaultModel: getDefaultModel(),
      allModels: getAllModels()
    };
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const requestId = req.requestId;
  console.log(`[${requestId}] === Processing Upload Request ===`);
  console.log(`[${requestId}] AI Model: ${req.body.aiModel || 'default'}`);
  
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

    const aiModel = req.body.aiModel?.toLowerCase() || getDefaultModel();
    const filePath = req.file.path;

    // Read the PDF file and convert to base64
    const pdfBuffer = fs.readFileSync(filePath);
    let pdfBase64 = pdfBuffer.toString('base64');

    let result;
    if (aiModel === 'claude') {
      result = await anthropicService.extractFinancialData(pdfBase64);
    } else if (aiModel === 'gpt-4') {
      result = await openAiService.extractFinancialData(pdfBase64);
    } else if (aiModel.startsWith('gemini-')) {
      result = await googleGenAIService.extractFinancialData(pdfBase64, aiModel);
    } else {
      throw new Error('Invalid AI model selected');
    }

    res.json({
      status: 'COMPLETED',
      message: 'File processed successfully',
      aiModel: aiModel,
      data: result.data,
      timing: result.timing
    });

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