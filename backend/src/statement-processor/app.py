import json
import logging
import boto3
import os
import tempfile
import mimetypes
import urllib.parse
from pdf_processor import process_pdf
from csv_processor import process_csv

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Lambda function to process statement files uploaded to S3
    Triggered by S3 ObjectCreated event
    """
    try:
        logger.info(f"Event received: {json.dumps(event)}")

        # Extract bucket name and object key from the S3 event
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        object_key = event['Records'][0]['s3']['object']['key']
        
        # URL decode the object key to handle encoded characters
        decoded_object_key = urllib.parse.unquote_plus(object_key)
        
        logger.info(f"Processing file from bucket: {bucket_name}, key: {object_key}")
        logger.info(f"Decoded object key: {decoded_object_key}")
        
        # Initialize S3 client
        s3_client = boto3.client('s3')
        
        # Determine file type
        file_extension = get_file_extension(decoded_object_key)
        logger.info(f"Detected file extension: {file_extension}")
        
        # Download the file to a temporary location
        temp_file_path = download_file_from_s3(s3_client, bucket_name, decoded_object_key, file_extension)
        
        try:
            # Process the file based on its type
            if file_extension.lower() == '.pdf':
                extracted_data = process_pdf(temp_file_path)
                logger.info("PDF processing completed successfully")
            elif file_extension.lower() == '.csv':
                extracted_data = process_csv(temp_file_path)
                logger.info("CSV processing completed successfully")
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
            
            logger.info(f"Extracted data: {json.dumps(extracted_data, indent=2)}")
            
            # TODO: Store processed data in DynamoDB
            # TODO: Update statement status
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'{file_extension.upper()} processing completed successfully',
                    'file_type': file_extension,
                    'extracted_data': extracted_data
                })
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Statement processing failed',
                'error': str(e)
            })
        }

def get_file_extension(object_key):
    """
    Extract file extension from S3 object key
    """
    _, extension = os.path.splitext(object_key)
    return extension

def download_file_from_s3(s3_client, bucket_name, object_key, file_extension):
    """
    Download file from S3 to a temporary location
    """
    # Create appropriate suffix based on file type
    suffix = file_extension if file_extension else '.tmp'
    
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp_file:
        s3_client.download_file(bucket_name, object_key, temp_file.name)
        temp_file_path = temp_file.name
    
    logger.info(f"File downloaded to temporary location: {temp_file_path}")
    return temp_file_path