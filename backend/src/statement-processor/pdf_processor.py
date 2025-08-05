import pdfplumber

def process_pdf(file_path):
    """
    Process a PDF file and extract all text content
    """
    print(f"Starting PDF processing for file: {file_path}")
    
    try:
        with pdfplumber.open(file_path) as pdf:
            print(f"PDF opened successfully. Number of pages: {len(pdf.pages)}")
            
            raw_text = ""
            for page_num, page in enumerate(pdf.pages):
                print(f"Processing page {page_num + 1}")

                bank = ""
                try:
                    text = page.extract_text()
                    raw_text += text
                    if text:
                        print(f"Page {page_num + 1} text length: {len(text)} characters")
                        if "chase.com" in text.lower() or "chase" in text.lower():
                            bank = "chase"
                        else:
                            bank = "unknown"
                    else:
                        print(f"No text extracted from page {page_num + 1}")
                except Exception as e:
                    print(f"Error extracting text from page {page_num + 1}: {e}")
                    continue
            
            return {
                "bank": bank,
                "raw_text": raw_text
            }

            print(f"Bank: {bank}")
            print(f"Raw text: {raw_text}")




            
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise e