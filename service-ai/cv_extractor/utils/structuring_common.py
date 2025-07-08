import os
import json
from cv_extractor.utils.file_utils import log_info, log_error

# Default output folder
DEFAULT_OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), "..", "api_output_structured")

def clean_llm_response(text: str) -> str:
    """Removes triple-backtick json formatting if present."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:].strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text
def save_raw_structured_output(filename, raw_text):
    path = os.path.join("api_output_structured", filename.replace(".docx", "_structured_raw.txt"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(raw_text)

def save_structured_result(file_path, structured_data, output_folder=DEFAULT_OUTPUT_FOLDER):
    """
    Saves structured data returned from LLM (OpenAI or Gemini).
    Tries to parse as JSON, saves clean JSON or fallback raw text.

    Returns:
        parsed_dict (if successful), else None
    """
    base_name = os.path.basename(file_path)
    name_without_ext = os.path.splitext(base_name)[0]
    os.makedirs(output_folder, exist_ok=True)

    structured_text = clean_llm_response(structured_data)

    json_path = os.path.join(output_folder, f"{name_without_ext}_structured.json")
    raw_path = os.path.join(output_folder, f"{name_without_ext}_structured_raw.txt")

    try:
        parsed = json.loads(structured_text)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
        log_info(f"✅ Structured output saved as JSON ➔ {json_path}")
        return parsed
    except Exception as e:
        with open(raw_path, "w", encoding="utf-8") as f:
            f.write(structured_data)
        log_error(f"⚠️ Structured output not valid JSON. Raw saved ➔ {raw_path} | Error: {e}")
        return None
