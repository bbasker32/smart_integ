import os
from odf.opendocument import load
from odf.text import P
from cv_extractor.utils.file_utils import save_text_as_txt, log_info, log_warn, log_error
from cv_extractor.utils.parser import clean_text
from cv_extractor.utils.structuring_api_gemini_direct import structure_with_gemini_direct
from cv_extractor.utils.structuring_api_direct import structure_with_openai_direct
from cv_extractor.utils.structuring_common import save_structured_result

def handle_odt_direct(file_path):
    filename = os.path.basename(file_path)
    log_info(f"🔐 Handling ODT with direct structuring: {filename}")

    try:
        # === Extract text from ODT ===
        odt_doc = load(file_path)
        paragraphs = odt_doc.getElementsByType(P)
        text = "\n".join([str(p.firstChild.data).strip() for p in paragraphs if p.firstChild])

        if not text.strip():
            log_warn(f"⚠️ No text extracted from {filename}")
            return None

        # === Clean & Save cleaned text ===
        folder = "output_odt"
        os.makedirs(folder, exist_ok=True)
        cleaned_text = clean_text(text)
        out_path = os.path.join(folder, os.path.splitext(filename)[0] + "_text.txt")
        save_text_as_txt(cleaned_text, out_path)
        log_info(f"✅ Cleaned text saved to: {out_path}")

        # === Try Gemini Direct ===
        try:
            structured_raw = structure_with_gemini_direct(cleaned_text)
            log_info("✅ Structured using Gemini Direct")
        except Exception as gemini_err:
            log_error(f"⚠️ Gemini Direct failed: {gemini_err}")
            try:
                structured_raw = structure_with_openai_direct(cleaned_text)
                log_info("✅ Structured using OpenAI Direct fallback")
            except Exception as openai_err:
                log_error(f"❌ OpenAI Direct also failed: {openai_err}")
                return None

        # === Save structured result and return JSON ===
        structured_json = save_structured_result(file_path, structured_raw)
        return structured_json

    except Exception as e:
        log_error(f"❌ Fatal error while handling ODT file {filename}: {e}")
        return None
