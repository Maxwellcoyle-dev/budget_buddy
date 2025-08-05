import json
import logging
import csv
import pandas as pd
from typing import List, Dict, Any

# Configure logging
logger = logging.getLogger()

def process_csv(file_path):
    """
    Process a CSV file and extract relevant financial data
    """
    extracted_data = {
        'rows': [],
        'headers': [],
        'metadata': {},
        'file_type': 'csv'
    }
    
    try:
        # Read CSV with pandas for better handling of different formats
        df = pd.read_csv(file_path)
        
        # Extract headers
        extracted_data['headers'] = df.columns.tolist()
        
        # Extract rows as list of dictionaries
        extracted_data['rows'] = df.to_dict('records')
        
        # Extract metadata
        extracted_data['metadata'] = {
            'num_rows': len(df),
            'num_columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'data_types': {col: str(dtype) for col, dtype in df.dtypes.to_dict().items()}
        }
        
        logger.info(f"Successfully processed CSV: {len(df)} rows, {len(df.columns)} columns")
        logger.info(f"Columns: {df.columns.tolist()}")

        logger.info(f"Extracted data: {extracted_data}")
        
        return extracted_data
        
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        raise e

def process_csv_alternative(file_path):
    """
    Alternative CSV processing using standard library csv module
    Use this if pandas is not available or for simpler CSV files
    """
    extracted_data = {
        'rows': [],
        'headers': [],
        'metadata': {},
        'file_type': 'csv'
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            csv_reader = csv.reader(csvfile)
            
            # Read headers
            headers = next(csv_reader, [])
            extracted_data['headers'] = headers
            
            # Read rows
            rows = []
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 since we already read headers
                if row:  # Skip empty rows
                    row_dict = dict(zip(headers, row))
                    rows.append(row_dict)
            
            extracted_data['rows'] = rows
            
            # Extract metadata
            extracted_data['metadata'] = {
                'num_rows': len(rows),
                'num_columns': len(headers),
                'column_names': headers
            }
        
        logger.info(f"Successfully processed CSV: {len(rows)} rows, {len(headers)} columns")
        return extracted_data
        
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        raise e
