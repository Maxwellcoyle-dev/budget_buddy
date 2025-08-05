#!/usr/bin/env python3
"""
Test script for the improved PDF processor
"""

import sys
import os
import json
import logging
from pdf_processor import process_pdf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_pdf_processing(pdf_path):
    """
    Test PDF processing and display results
    """
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}")
        return
    
    print(f"Testing PDF processing for: {pdf_path}")
    print("=" * 60)
    
    try:
        # Process the PDF
        result = process_pdf(pdf_path)
        
        # Display results
        print(f"\nProcessing completed successfully!")
        print(f"Total transactions found: {len(result['transactions'])}")
        print(f"Transaction pages identified: {result['summary']['transaction_pages_found']}")
        
        if result['statement_info']:
            print(f"\nStatement Information:")
            for key, value in result['statement_info'].items():
                print(f"  {key}: {value}")
        
        if result['transactions']:
            print(f"\nTransactions:")
            for i, transaction in enumerate(result['transactions'][:10], 1):  # Show first 10
                print(f"  {i}. {transaction['date']} - {transaction['description'][:50]}... - ${transaction['amount']:.2f} ({transaction['type']})")
            
            if len(result['transactions']) > 10:
                print(f"  ... and {len(result['transactions']) - 10} more transactions")
        
        # Save results to JSON file
        output_file = f"{os.path.splitext(pdf_path)[0]}_results.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\nResults saved to: {output_file}")
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        import traceback
        traceback.print_exc()

def main():
    if len(sys.argv) != 2:
        print("Usage: python test_pdf_processor.py <path_to_pdf>")
        print("Example: python test_pdf_processor.py statement.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    test_pdf_processing(pdf_path)

if __name__ == "__main__":
    main() 