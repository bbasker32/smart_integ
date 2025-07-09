import os
import logging
import mimetypes
import fitz
from pdfminer.high_level import extract_text

def setup_logging():
    logging.basicConfig(
        filename='cv_extraction.log',
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO
    )
    logging.info("Logging initialized.")

def get_file_type(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    logging.info(f"Detected file type: {ext} for file: {file_path}")
    return ext

def save_text_as_txt(text, output_path):
    try:
        logging.info(f"Saving extracted text to TXT: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text.strip())
        logging.info(f"Text saved successfully to: {output_path}")
    except Exception as e:
        logging.error(f"Failed to save TXT to {output_path}: {e}")


def extract_text_pdfminer(file_path):
    try:
        logging.info(f"Extracting text using PDFMiner: {file_path}")
        text = extract_text(file_path)
        logging.info(f"PDFMiner extraction complete for: {file_path}")
        return text
    except Exception as e:
        logging.error(f"PDFMiner extraction failed for {file_path}: {e}")
        return ""

def extract_text_pymupdf(file_path):
    try:
        logging.info(f"Extracting text using PyMuPDF: {file_path}")
        doc = fitz.open(file_path)
        text = "\n".join([page.get_text() for page in doc])
        logging.info(f"PyMuPDF extraction complete for: {file_path}")
        return text
    except Exception as e:
        logging.error(f"PyMuPDF extraction failed for {file_path}: {e}")
        return ""

def log_info(message): logging.info(message)
def log_warn(message): logging.warning(message)
def log_error(message): logging.error(message)
