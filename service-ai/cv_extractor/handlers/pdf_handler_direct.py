import os
from cv_extractor.utils.parser import clean_text
from cv_extractor.utils.ocr_utils import is_scanned_pdf, extract_text_from_image_pdf
from cv_extractor.utils.file_utils import (
    extract_text_pdfminer,
    extract_text_pymupdf,
    save_text_as_txt,
    log_info,
    log_warn,
    log_error
)
from cv_extractor.utils.structuring_api_direct import structure_with_openai_direct
from cv_extractor.utils.structuring_api_gemini_direct import structure_with_gemini_direct
from cv_extractor.utils.structuring_common import save_structured_result  # ✅ unified save logic

def handle_pdf_direct(file_path):
    filename = os.path.basename(file_path)
    log_info(f"🔐 Handling PDF with direct structuring: {filename}")

    try:
        # === Extract text ===
        if is_scanned_pdf(file_path):
            log_info(f"{filename} detected as scanned (image-based). Using OCR.")
            text = extract_text_from_image_pdf(file_path)
            folder = "output_ocr"
        else:
            log_info(f"{filename} detected as text-based. Using PDFMiner.")
            text = extract_text_pdfminer(file_path)
            if not text.strip():
                log_warn(f"{filename}: PDFMiner returned empty. Using PyMuPDF fallback.")
                text = extract_text_pymupdf(file_path)
            folder = "output_pdf"

        if not text.strip():
            log_warn(f"⚠️ No text extracted from {filename}")
            return None

        # === Clean & Save ===
        os.makedirs(folder, exist_ok=True)
        cleaned_text = clean_text(text)
        out_path = os.path.join(folder, os.path.splitext(filename)[0] + "_text.txt")
        save_text_as_txt(cleaned_text, out_path)
        log_info(f"✅ Cleaned text saved to: {out_path}")

        # === Try Gemini direct ===
        try:
            structured_raw = structure_with_openai_direct(cleaned_text)
            log_info("✅ Structured using OpenAI Direct")
        except Exception as openai_err:
                log_error(f"⚠️ OpenAI Direct failed: {openai_err}")
                try:
                    structured_raw = structure_with_gemini_direct(cleaned_text)
                    log_info("✅ Structured using Gemini Direct fallback")
                except Exception as gemini_err:
                    log_error(f"❌ Gemini Direct also failed: {gemini_err}")
                    return None


        # === Save structured result and return JSON ===
        structured_json = save_structured_result(file_path, structured_raw)
        return structured_json

    except Exception as e:
        log_error(f"❌ Fatal error while handling {filename}: {e}")
        return None
