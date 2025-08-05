# PDF Processor Improvements

## Overview

The PDF processor has been significantly improved to better handle various bank statement formats and extract transaction data more accurately.

## Key Improvements

### 1. Transaction Page Detection

- **Smart Page Identification**: The processor now identifies pages containing transaction data by looking for keywords like "ACCOUNT ACTIVITY", "TRANSACTION HISTORY", etc.
- **Focused Processing**: Only processes pages that are likely to contain transaction data, improving performance and accuracy.
- **Fallback Mechanism**: If no transaction pages are identified, falls back to processing all pages.

### 2. Enhanced Transaction Extraction

- **Multiple Format Support**: Handles various bank statement formats including:
  - MM/DD format (e.g., "07/07 AUTOMATIC PAYMENT - THANK YOU -78.96")
  - Full date format (e.g., "07/07/2024 AUTOMATIC PAYMENT - THANK YOU -78.96")
  - Different column arrangements
- **Specific Format Handler**: Dedicated function to handle the exact format you mentioned with "Date of Transaction Merchant Name or Transaction Description $ Amount"
- **Line-by-Line Parsing**: Robust parsing that handles individual transaction lines even without clear headers

### 3. Improved Pattern Matching

- **Enhanced Regex Patterns**: Multiple patterns to catch different transaction formats
- **Better Amount Parsing**: Handles negative amounts, currency symbols, and various number formats
- **Flexible Date Parsing**: Supports MM/DD format by automatically adding current year

### 4. Configuration Constants

- **Performance Limits**: Configurable limits to prevent timeouts and memory issues
- **Processing Limits**: Maximum pages, text length, matches per pattern, etc.

## Usage

### Testing with Your PDF

```bash
cd backend/src/statement-processor
python test_pdf_processor.py your_statement.pdf
```

### Expected Output

The processor will:

1. Identify transaction pages
2. Extract transactions using multiple methods
3. Save results to a JSON file
4. Display summary information

### Example Output Format

```json
{
  "transactions": [
    {
      "date": "2024-07-07",
      "description": "AUTOMATIC PAYMENT - THANK YOU",
      "amount": -78.96,
      "type": "credit",
      "category": "Other",
      "source": "specific_format_extraction"
    }
  ],
  "statement_info": {
    "account_number": "1234-5678-9012-3456",
    "statement_period": {
      "start_date": "06/01/2024",
      "end_date": "06/30/2024"
    }
  },
  "summary": {
    "total_transactions": 15,
    "total_amount": -1250.45,
    "transaction_types": ["debit", "credit"],
    "transaction_pages_found": 1
  }
}
```

## Supported Formats

### 1. Your Specific Format

```
Date of Transaction Merchant Name or Transaction Description $ Amount
07/07     AUTOMATIC PAYMENT - THANK YOU -78.96
06/15     & STRAIGHTTALK*SERVICES 877-430-2355 FL 49.90
06/28     & Peacock 757E3 PremPlus 212-6640138 NY 14.83
07/02     & Amazon web services aws.amazon.co WA 19.65
```

### 2. Standard Formats

- MM/DD format with description and amount
- Full date format (MM/DD/YYYY)
- Various column arrangements
- Table-based transaction data

## Configuration

### Constants (in pdf_processor.py)

```python
MAX_PAGES_TO_PROCESS = 10  # Maximum pages to process
MAX_TEXT_LENGTH = 50000    # 50KB limit for text processing
MAX_MATCHES_PER_PATTERN = 100  # Limit matches per regex pattern
MAX_TABLES_PER_PAGE = 3    # Limit tables processed per page
MAX_ROWS_PER_TABLE = 50    # Limit rows processed per table
```

### Transaction Page Keywords

```python
TRANSACTION_PAGE_KEYWORDS = [
    'account activity',
    'transaction history',
    'account summary',
    'statement of account',
    'account statement',
    'transaction detail',
    'account transactions',
    'activity summary',
    'transaction list',
    'account charges',
    'debit transactions',
    'credit transactions'
]
```

## Troubleshooting

### Common Issues

1. **No transactions found**: Check if the PDF contains transaction pages with the expected keywords
2. **Wrong date parsing**: Verify the date format in your statement
3. **Amount parsing errors**: Check for unusual currency symbols or number formats

### Debugging

- Enable detailed logging to see extraction process
- Check the generated JSON file for detailed results
- Review the console output for processing steps

## Future Enhancements

- Machine learning-based transaction categorization
- Support for more bank-specific formats
- OCR fallback for image-based PDFs
- Automatic format detection and learning
