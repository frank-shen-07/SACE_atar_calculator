import pdfplumber
import pandas as pd

# Path to your PDF file
pdf_path = "/Users/frankshen/Downloads/Atar calculator/rawdata/SACE&NTCET_University-Aggregate-to-ATAR-2024.pdf"

# Output CSV file
output_csv = "tables_extracted.csv"

# Open the PDF file
tables = []
with pdfplumber.open(pdf_path) as pdf:
    for page_number, page in enumerate(pdf.pages, start=1):
        print(f"Processing page {page_number}...")
        try:
            # Extract tables from the page
            extracted_tables = page.extract_tables()
            for table in extracted_tables:
                # Append each table as a DataFrame
                tables.append(pd.DataFrame(table))
        except Exception as e:
            print(f"Error processing page {page_number}: {e}")

# Combine all tables into one CSV if there are multiple tables
if tables:
    combined_table = pd.concat(tables, ignore_index=True)
    combined_table.to_csv(output_csv, index=False)
    print(f"Tables have been successfully extracted to {output_csv}.")
else:
    print("No tables were found in the PDF.")
