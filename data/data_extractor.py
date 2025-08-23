# First, you need to install the PyPDF2 library:
# pip install PyPDF2

import re
from PyPDF2 import PdfReader

def extract_loan_info(pdf_path):
    """
    Extracts key information from a Loan Estimate PDF.

    Args:
        pdf_path (str): The file path to the PDF document.

    Returns:
        dict: A dictionary containing the extracted loan information.
    """
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"

        # DEBUG: Print the raw extracted text to see the actual format
        print("=== RAW EXTRACTED TEXT ===")
        print(repr(full_text))  # repr() shows whitespace characters
        print("========================")

        # --- Use regular expressions to find specific values ---
        # Note: These patterns are based on the sample PDF and may need
        # to be adjusted for different PDF layouts.

        # Try multiple patterns for each field to handle different formats
        loan_amount_patterns = [
            r"Loan Amount\s*\n\s*\$([\d,.]+)",
            r"Loan Amount\s*\$([\d,.]+)",
            r"Loan Amount.*?\$([\d,.]+)",
            r"loan amount.*?\$([\d,.]+)"
        ]
        
        interest_rate_patterns = [
            r"Interest Rate\s*\n\s*([\d.]+)%",
            r"Interest Rate\s*([\d.]+)%",
            r"Interest Rate.*?([\d.]+)%",
            r"interest rate.*?([\d.]+)%"
        ]
        
        closing_costs_patterns = [
            r"Total Closing Costs \(J\)\s*\n\s*-?\$([\d,.]+)",
            r"Total Closing Costs.*?\$([\d,.]+)",
            r"total closing costs.*?\$([\d,.]+)",
            r"Closing Costs.*?\$([\d,.]+)"
        ]
        
        date_issued_patterns = [
            r"DATE ISSUED\s*\n\s*([\d/]+)",
            r"DATE ISSUED\s*([\d/]+)",
            r"Date Issued.*?([\d/]+)",
            r"date issued.*?([\d/]+)"
        ]
        
        loan_id_patterns = [
            r"LOAN ID #\s*(\d+)",
            r"LOAN ID.*?(\d+)",
            r"Loan ID.*?(\d+)",
            r"loan id.*?(\d+)"
        ]
        
        points_patterns = [
            r"% of Loan Amount \(Points\)\s*\n\s*([\d.]+)%",
            r"% of Loan Amount \(Points\)\s*([\d.]+)%",
            r"% of Loan Amount.*?([\d.]+)%",
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
    # IMPORTANT: Replace 'Sample-Loan-Estimate.pdf' with the actual path to your PDF file.
    pdf_file_path = "Sample-Loan-Estimate.pdf"
    extracted_data = extract_loan_info(pdf_file_path)

    # --- Print the results ---
    if "error" in extracted_data:
        print(f"Error: {extracted_data['error']}")
    else:
        print("--- Extracted Loan Information ---")
        for key, value in extracted_data.items():
            print(f"{key}: {value}")
        print("---------------------------------")

