# PDF Processor Lambda Function

This Lambda function processes PDF statements uploaded to S3 and extracts financial data.

## Function Overview

- **Trigger**: S3 ObjectCreated event (only for .pdf files)
- **Runtime**: Python 3.11
- **Purpose**: Extract text and financial data from PDF statements

## Current Implementation

The function currently:

1. Receives S3 event when a PDF is uploaded
2. Creates a job record in DynamoDB
3. Updates job status to 'processing'
4. Simulates processing time
5. Updates job status to 'completed'

## TODO: Add PDF Processing Logic

The main PDF processing logic needs to be added in the `lambda_handler` function where the TODO comment is located. This should include:

1. **Download PDF from S3**
2. **Extract text using pdfplumber or PyPDF2**
3. **Parse financial data** (transactions, account info, etc.)
4. **Store processed data** in DynamoDB
5. **Update job status** with results

## Dependencies

- `boto3`: AWS SDK for Python
- `pdfplumber`: PDF text extraction
- `PyPDF2`: Alternative PDF processing
- `pandas`: Data manipulation
- `numpy`: Numerical operations

## Environment Variables

- `STATEMENTS_TABLE`: DynamoDB table name for storing job records
- `S3_BUCKET`: S3 bucket name for PDF storage

## Testing

To test locally:

```bash
sam local invoke PDFProcessorFunction --event events/s3-event.json
```
