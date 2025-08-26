# Direct PDF AI Compare

A web application that compares AI model performance by extracting structured financial data from PDF quarterly reports using direct PDF upload. The application supports Anthropic Claude, OpenAI GPT-4, and Google Gemini for intelligent document processing and comparison.

## Features

- **Multiple AI Providers**: Choose between Claude, GPT-4, and Gemini for PDF processing
- **Structured Data Extraction**: Extracts financial metrics in a standardized JSON format
- **Real-time Processing**: Upload and process PDFs with live status updates
- **Clean UI**: Modern Vue.js interface with drag-and-drop file upload
- **Automatic Cleanup**: Files are automatically deleted after processing
- **Error Handling**: Comprehensive error handling and validation

## Prerequisites

- Node.js (v16 or higher) or Bun runtime
- API keys for one or more AI providers:
  - Anthropic Claude API key
  - OpenAI API key
  - Google Gemini API key

## Installation

1. **Install dependencies:**
   ```bash
   bun install
   cd frontend && bun install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   ANTHROPIC_API_KEY=your_anthropic_api_key
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Start the application:**
   
   For development (runs both backend and frontend):
   ```bash
   bun run dev:all
   ```
   
   Or run separately:
   ```bash
   # Backend only
   bun run dev
   
   # Frontend only (in another terminal)
   bun run dev:frontend
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (frontend)
2. Select an AI model (Claude, GPT-4, or Gemini)
3. Drag and drop a PDF file or click to upload
4. Wait for processing to complete
5. View extracted financial data in structured format

## API Endpoints

### POST /upload
Upload a PDF file for financial data extraction.

**Request:**
- `file`: PDF file (multipart/form-data)
- `aiModel`: AI provider ("claude", "gpt-4", or "gemini")

**Response:**
```json
{
  "status": "COMPLETED",
  "message": "File processed successfully",
  "aiModel": "claude",
  "data": {
    "currentQuarter": {
      "revenueFromOps": 1000.50,
      "otherIncome": 50.25,
      "depreciation": 25.00,
      "financeCosts": 15.75,
      "totalExpenses": 800.00,
      "profitLossBeforeTax": 200.00,
      "profitLossForThePeriod": 150.00,
      "period": "Q1 2024"
    },
    "previousYearQuarter": {
      // Same structure for YoY comparison
    }
  },
  "timing": {
    "start": 1640995200000,
    "end": 1640995230000,
    "duration": 30000
  }
}
```

## Project Structure

```
├── server.js              # Express server
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── services/              # AI service providers
│   ├── anthropicAiService.js
│   ├── openAiService.js
│   └── googleGenAI.js
├── frontend/              # Vue.js frontend
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
└── uploads/               # Temporary file storage (auto-cleaned)
```

## Supported Financial Metrics

The application extracts the following financial metrics:

- Revenue from Operations
- Other Income
- Depreciation
- Finance Costs
- Total Expenses
- Profit/Loss before Exceptional Items and Tax
- Exceptional Items
- Share of P&L of Associates
- Profit/Loss before Tax
- Profit/Loss after Tax from Ordinary Activities
- Prior Year Adjustments
- Extraordinary Items
- Net Profit/Loss for the Period

## AI Provider Details

### Anthropic Claude
- Uses Claude 3.5 Sonnet model
- Best for detailed financial analysis
- Supports direct PDF processing

### OpenAI GPT-4
- Uses GPT-4 Vision model
- Excellent for document understanding
- Converts PDF to images for processing

### Google Gemini
- Uses Gemini 2.0 Flash model
- Fast processing with structured output
- Native PDF support

## Error Handling

The application includes comprehensive error handling:
- File validation (PDF only)
- API key validation
- Processing timeouts
- Malformed response handling
- Automatic file cleanup on errors

## Security Considerations

- API keys are stored in environment variables
- Uploaded files are automatically deleted after processing
- No persistent file storage
- Input validation for file types and sizes
- Error messages don't expose sensitive information

## License

MIT License