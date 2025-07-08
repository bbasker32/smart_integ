import os
import json
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
from cv_extractor.utils.llm_runner import run_llm_on_txt_file
from cv_extractor.utils.structuring_api import structure_with_openai
from cv_extractor.utils.structuring_api_gemini import structure_with_gemini
from cv_extractor.utils.merger import merge_json_outputs


def clean_json_block(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:].strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text


def save_structured_json(cleaned_txt_path, structured_text):
    structured_text = clean_json_block(structured_text)

    try:
        structured_json = json.loads(structured_text)
    except json.JSONDecodeError as e:
        raw_path = cleaned_txt_path.replace("_cleaned.txt", "_structured_raw.txt")
        with open(raw_path, "w", encoding="utf-8") as f:
            f.write(structured_text)
        log_error(f"❌ Failed to parse structured output as JSON: {e}")
        log_error(f"📄 Raw structured output saved: {raw_path}")
        print("⚠️ Structured text that failed to parse:\n", structured_text)
        return None

    json_path = cleaned_txt_path.replace("_cleaned.txt", "_structured.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(structured_json, f, indent=2, ensure_ascii=False)

    log_info(f"✅ Structured output saved as JSON: {json_path}")
    print(f"✅ Structured output saved as JSON: {json_path}")
    return structured_json


def handle_pdf(file_path):
    filename = os.path.basename(file_path)
    log_info(f"📄 Handling PDF file: {filename}")

    try:
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
            print(f"⚠️ No text extracted from {filename}")
            return None

        os.makedirs(folder, exist_ok=True)
        cleaned_text = clean_text(text)
        out_path = os.path.join(folder, os.path.splitext(filename)[0] + "_text.txt")

        try:
            save_text_as_txt(cleaned_text, out_path)
            log_info(f"✅ PDF text saved to: {out_path}")
            print(f"✅ Saved to: {out_path}")
        except Exception as save_err:
            log_error(f"❌ Error saving PDF text: {save_err}")
            return None

        try:
            run_llm_on_txt_file(out_path)
        except Exception as llm_err:
            log_error(f"❌ LLM processing failed: {llm_err}")
            print(f"⚠️ LLM post-processing failed")

        cleaned_txt_path = out_path.replace("_text.txt", "_cleaned.txt")

        if not os.path.exists(cleaned_txt_path):
            log_warn(f"⚠️ Cleaned file not found: {cleaned_txt_path}")
            return None

        with open(cleaned_txt_path, "r", encoding="utf-8") as f:
            cleaned_content = f.read()

        if not cleaned_content.strip():
            log_warn(f"⚠️ Cleaned content is empty for {filename}")
            return None

        # === Try structuring with OpenAI then fallback to Gemini ===
        try:
            structured_data = structure_with_openai(cleaned_content)
            log_info(f"✅ Structured using OpenAI API")
        except Exception as openai_err:
            log_error(f"⚠️ OpenAI failed: {openai_err}")
            try:
                structured_data = structure_with_gemini(cleaned_content)
                log_info(f"✅ Structured using Gemini fallback")
            except Exception as gemini_err:
                log_error(f"❌ Gemini also failed: {gemini_err}")
                print(f"❌ Could not structure: {filename}")
                return None

        # === Save structured JSON ===
        result = save_structured_json(cleaned_txt_path, structured_data)
        if result is None:
            log_error("❌ Structured JSON could not be parsed or saved.")
            return None

        # === Merge and return the final result ===
        merged_result = merge_json_outputs(cleaned_txt_path)
        if not merged_result:
            log_error("❌ Merged result is empty.")
            return None

        return merged_result

    except Exception as e:
        log_error(f"❌ Fatal error while handling {filename}: {e}")
        print(f"❌ Failed to process {filename}")
        return None
