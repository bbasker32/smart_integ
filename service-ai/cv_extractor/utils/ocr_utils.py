import fitz
import pytesseract
import tempfile
import cv2
import logging

pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

def is_scanned_pdf(file_path):
    logging.info(f"Checking if PDF is scanned: {file_path}")
    try:
        doc = fitz.open(file_path)
        for page in doc:
            if page.get_images(full=True):
                logging.info(f"PDF is scanned (image-based): {file_path}")
                return True
        logging.info(f"PDF is text-based: {file_path}")
        return False
    except Exception as e:
        logging.error(f"Error checking if PDF is scanned: {file_path}: {e}")
        return False

def extract_text_from_image_pdf(file_path):
    logging.info(f"Running OCR on scanned PDF: {file_path}")
    try:
        doc = fitz.open(file_path)
        full_text = ""
        for page in doc:
            pix = page.get_pixmap(dpi=300)
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
                tmp_img.write(pix.tobytes("png"))
                img_path = tmp_img.name
            img = cv2.imread(img_path)
            text = pytesseract.image_to_string(img)
            full_text += text + "\n"
        logging.info(f"OCR extraction complete for: {file_path}")
        return full_text
    except Exception as e:
        logging.error(f"OCR extraction failed for {file_path}: {e}")
        return ""
