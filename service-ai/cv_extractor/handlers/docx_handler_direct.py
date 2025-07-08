import os
import json
import re
from docx import Document
from cv_extractor.utils.parser import clean_text
from cv_extractor.utils.file_utils import (
    save_text_as_txt,
    log_info,
    log_warn,
    log_error
)
from cv_extractor.utils.structuring_api_gemini_direct import structure_with_gemini_direct
from cv_extractor.utils.structuring_api_direct import structure_with_openai_direct
from cv_extractor.utils.structuring_common import save_structured_result, save_raw_structured_output


def clean_trailing_commas(json_text):
    # Remove trailing commas before } or ]
    return re.sub(r',\s*([}\]])', r'\1', json_text)


def handle_docx_direct(file_path):
    filename = os.path.basename(file_path)
    log_info(f"🔐 Handling DOCX with direct structuring: {filename}")

    try:
        # === Extract text from DOCX ===
        doc = Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        if not text.strip():
            log_warn(f"⚠️ No text extracted from {filename}")
            return None

        # === Clean & Save ===
        folder = "output_docx"
        os.makedirs(folder, exist_ok=True)
        cleaned_text = clean_text(text)
        out_path = os.path.join(folder, os.path.splitext(filename)[0] + "_text.txt")
        save_text_as_txt(cleaned_text, out_path)
        log_info(f"✅ Cleaned text saved to: {out_path}")

        # === Try OpenAI first, fallback to Gemini ===
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

        # === Try parsing the structured output as JSON ===
        # === Save structured result and return JSON ===
        structured_json = save_structured_result(file_path, structured_raw)
        return structured_json
    
    except Exception as e:
        log_error(f"❌ Fatal error while handling {filename}: {e}")
        return None
