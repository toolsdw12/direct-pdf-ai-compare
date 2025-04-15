# PDF Text Extractor

A web application that extracts text from PDF files using Amazon Textract. Built with Vue.js frontend and Node.js backend.

## Prerequisites

- Node.js (v16 or higher)
- AWS Account with Amazon Textract access
- AWS S3 bucket for file storage

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd textract-pdf-extractor
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```
     AWS_REGION=your_aws_region
     AWS_ACCESS_KEY_ID=your_access_key_id
     AWS_SECRET_ACCESS_KEY=your_secret_access_key
     AWS_S3_BUCKET=your_s3_bucket_name
     ```

5. Start the backend server:
```bash
# From the root directory
npm run dev
```

6. Start the frontend development server:
```bash
# From the frontend directory
npm run serve
```

## Usage

1. Open your browser and navigate to `http://localhost:8080`
2. Drag and drop a PDF file or click to choose a file
3. Wait for the processing to complete
4. View the extracted text in the results section

## Features

- Drag and drop PDF file upload
- Real-time processing status updates
- Clean and modern UI
- Error handling and validation
- Asynchronous text extraction

## API Endpoints

- `POST /upload`: Upload a PDF file for processing
- `GET /result/:jobId`: Check the status and get results of a processing job

## Security Considerations

- Store AWS credentials securely
- Implement proper error handling
- Validate file types and sizes
- Clean up temporary files after processing

## License

MIT 