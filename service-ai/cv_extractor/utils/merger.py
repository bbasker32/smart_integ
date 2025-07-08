import os
import json
from cv_extractor.utils.file_utils import log_info, log_warn, log_error  # Optional logging

def load_json_if_exists(path):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            log_error(f"❌ Failed to load JSON from {path}: {e}")
    return {}

def merge_json_outputs(cleaned_txt_path):
    base_path = cleaned_txt_path.replace("_cleaned.txt", "")
    sensitive_path = base_path + "_sensitive_info.json"
    structured_path = base_path + "_structured.json"
    output_path = base_path + "_final_merged.json"

    sensitive_data = load_json_if_exists(sensitive_path)
    structured_data = load_json_if_exists(structured_path)

    if not sensitive_data and not structured_data:
        log_warn(f"⚠️ Skipped merge: both JSONs missing or empty for {base_path}")
        return None

    # ✅ Flat merge (OpenAI can overwrite local LLM if same keys exist)
    merged = {**sensitive_data, **structured_data}

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2, ensure_ascii=False)
        log_info(f"✅ Flat merged JSON saved: {output_path}")
        print(f"✅ Final flat merged JSON ➔ {output_path}")
        return merged  # Return the merged data
    except Exception as e:
        log_error(f"❌ Failed to save merged JSON: {e}")
        return None
