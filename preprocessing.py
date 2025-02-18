import os
import pandas as pd
from tabula import read_pdf
from pdf2image import convert_from_path
import pytesseract
from io import BytesIO
from PIL import Image

# Path to your PDF file
pdf_path = "input.pdf"
output_excel_path = "output.xlsx"

# Extract tables from the PDF
tables = read_pdf(pdf_path, pages="all", multiple_tables=True)

# Save tables into an Excel file
with pd.ExcelWriter(output_excel_path, engine="openpyxl") as writer:
    for i, table in enumerate(tables):
        table.to_excel(writer, sheet_name=f"Page_{i+1}", index=False)

print(f"Tables extracted and saved to {output_excel_path}")

# If tables are not detected due to being scanned, apply OCR
def extract_text_from_scanned_pdf(pdf_path):
    images = convert_from_path(pdf_path)
    extracted_tables = []
    
    for i, image in enumerate(images):
        # Convert image to grayscale
        gray = image.convert("L")
        # Use Tesseract OCR
        text = pytesseract.image_to_string(gray)
        extracted_tables.append(pd.DataFrame({"Extracted Text": text.split("\n")}))
    
    return extracted_tables

# If no tables were found, try OCR-based extraction
if not tables:
    print("No tables found, attempting OCR-based extraction...")
    tables = extract_text_from_scanned_pdf(pdf_path)
    with pd.ExcelWriter(output_excel_path, engine="openpyxl") as writer:
        for i, table in enumerate(tables):
            table.to_excel(writer, sheet_name=f"Page_{i+1}_OCR", index=False)

    print(f"OCR-extracted text saved to {output_excel_path}")