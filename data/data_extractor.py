# First, you need to install the PyPDF2 library:
# pip install PyPDF2

import re
from PyPDF2 import PdfReader
import os

def extract_loan_info(pdf_path):
    """
    Extracts key information from a Loan Estimate PDF.

    Args:
        pdf_path (str): The file path to the PDF document.

    Returns:
        dict: A dictionary containing the extracted loan information.
    """
    try:
        # Check if file exists
        if not os.path.exists(pdf_path):
            return {"error": f"File not found: {pdf_path}"}
        
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            full_text += page_text + "\n"
        
        # If no text was extracted, it might be a scanned PDF
        if len(full_text.strip()) <= 5:
            return {"error": f"No text could be extracted from {pdf_path}. This might be a scanned PDF that requires OCR."}

        # DEBUG: Print the raw extracted text to see the actual format (disabled)
        # print("=== RAW EXTRACTED TEXT ===")
        # print(repr(full_text))  # repr() shows whitespace characters
        # print("========================")

        # --- Use regular expressions to find specific values ---
        # Note: These patterns are based on the sample PDF and may need
        # to be adjusted for different PDF layouts.

        # Try multiple patterns for each field to handle different formats
        # Updated patterns based on actual PDF text structure
        loan_amount_patterns = [
            r"Loan Amount\s*\n\s*\$([\d,.]+)",
            r"Loan Amount\s*\$([\d,.]+)",
            r"SALE PRICE\s*\$([\d,.]+)",  # Sometimes loan amount appears as sale price
            r"loan amount.*?\$([\d,.]+)"
        ]
        
        interest_rate_patterns = [
            r"Interest Rate\s*\n\s*([\d.]+)%",
            r"Interest Rate\s*([\d.]+)%",
            r"\$[\d,.]+\s+([\d.]+)%",  # Pattern like "$400,000 4.750%"
            r"([\d.]+)%\s*\n\s*\$[\d,.]+",
            r"interest rate.*?([\d.]+)%"
        ]
        
        closing_costs_patterns = [
            r"Estimated Closing Costs.*?\$(\d+,\d+)",  # Works for both PDFs
            r"Total Closing Costs \(J\)\s*\$(\d+,\d+)",  # Standard pattern  
            r"J\.TOTAL CLOSING COSTS.*?\$(\d+,\d+)",  # More specific pattern
            r"D\+I\s*\$(\d+,\d+)",  # For detailed format
            r"total closing costs.*?\$(\d+,\d+)"
        ]
        
        date_issued_patterns = [
            r"DATE ISSUED\s*\n\s*([\d/]+)",
            r"DATE ISSUED\s+([\d/]+)",
            r"Date Issued.*?([\d/]+)",
            r"date issued.*?([\d/]+)"
        ]
        
        loan_id_patterns = [
            r"LOAN ID#\s*([A-Z]\d+)",  # More specific for patterns like R002390
            r"LOAN ID#\s*(\w+)",
            r"LOAN ID.*?([A-Z]\d+)",
            r"loan id.*?(\w+)"
        ]
        
        points_patterns = [
            r"(\d+)% of Loan Amount \(Points\)",  # Pattern like "1% of Loan Amount (Points)"
            r"% of Loan Amount \(Points\)\s*([\d.]+)%",
            r"Points.*?([\d.]+)%",
            r"points.*?([\d.]+)%"
        ]

        # Function to try multiple patterns
        def find_match(patterns, text):
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    return match
            return None

        loan_amount_match = find_match(loan_amount_patterns, full_text)
        interest_rate_match = find_match(interest_rate_patterns, full_text)
        closing_costs_match = find_match(closing_costs_patterns, full_text)
        date_issued_match = find_match(date_issued_patterns, full_text)
        loan_id_match = find_match(loan_id_patterns, full_text)
        points_match = find_match(points_patterns, full_text)

        # --- Store the extracted data in a dictionary ---
        loan_data = {
            "File Name": pdf_path,
            "Date Issued": date_issued_match.group(1) if date_issued_match else "Not Found",
            "Loan ID": loan_id_match.group(1) if loan_id_match else "Not Found",
            "Loan Amount": f"${loan_amount_match.group(1)}" if loan_amount_match else "Not Found",
            "Interest Rate": f"{interest_rate_match.group(1)}%" if interest_rate_match else "Not Found",
            "Points": f"{points_match.group(1)}%" if points_match else "Not Found",
            "Total Closing Costs": f"${closing_costs_match.group(1)}" if closing_costs_match else "Not Found",
        }

        return loan_data

    except FileNotFoundError:
        return {"error": "File not found. Please check the path."}
    except Exception as e:
        return {"error": f"An error occurred: {e}"}

# --- Main execution ---
if __name__ == "__main__":
    # Process both loan estimate PDFs
    pdf_files = [
        "loan-estimate-A.pdf",
        "loan-estimate-B.pdf"
    ]
    
    all_loan_data = {}
    
    for pdf_file in pdf_files:
        print(f"\n{'='*50}")
        print(f"Processing: {pdf_file}")
        print(f"{'='*50}")
        
        extracted_data = extract_loan_info(pdf_file)
        
        # Store the data for comparison
        lender_name = "Lender A" if "A" in pdf_file else "Lender B"
        all_loan_data[lender_name] = extracted_data
        
        # --- Print the results ---
        if "error" in extracted_data:
            print(f"Error: {extracted_data['error']}")
        else:
            print(f"--- {lender_name} Loan Information ---")
            for key, value in extracted_data.items():
                if key != "File Name":  # Skip file name in individual output
                    print(f"{key}: {value}")
            print("-" * 40)
    
    # Print comparison summary
    print(f"\n{'='*50}")
    print("LOAN COMPARISON SUMMARY")
    print(f"{'='*50}")
    
    if len(all_loan_data) == 2:
        lender_a_data = all_loan_data.get("Lender A", {})
        lender_b_data = all_loan_data.get("Lender B", {})
        
        if not any("error" in data for data in [lender_a_data, lender_b_data]):
            print(f"{'Field':<20} {'Lender A':<15} {'Lender B':<15}")
            print("-" * 50)
            
            fields_to_compare = ["Loan Amount", "Interest Rate", "Points", "Total Closing Costs"]
            for field in fields_to_compare:
                lender_a_val = lender_a_data.get(field, "Not Found")
                lender_b_val = lender_b_data.get(field, "Not Found")
                print(f"{field:<20} {lender_a_val:<15} {lender_b_val:<15}")
        else:
            print("Cannot create comparison due to errors in data extraction.")
    else:
        print("Need both loan estimates to create comparison.")

