import os
import json
import logging
import torch
import ctransformers
import time
import re
import openai

# === Configuration ===
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../models/mistral-7b-instruct-v0.1.Q2_K.gguf')
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAX_NEW_TOKENS = 100
MAX_INPUT_LENGTH = 800
openai.api_key = os.getenv("OPENAI_API_KEY")  # Or hardcode for testing

# === Logging Setup ===
logging.basicConfig(
    filename="cv_extraction.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# === Device Info Logging ===
if DEVICE == "cuda":
    gpu_name = torch.cuda.get_device_name(0)
    logging.info(f"🚀 Using GPU: {gpu_name}")
    print(f"🚀 Using GPU: {gpu_name}")
else:
    logging.info("🖥️ Using CPU")
    print("🖥️ Using CPU")

# === Load Local Model ===
try:
    llm = ctransformers.LLM(
        model_path=MODEL_PATH,
        model_type="mistral",
    )
    logging.info(f"✅ Model loaded on {DEVICE.upper()} from: {MODEL_PATH}")
except Exception as e:
    logging.error(f"❌ Failed to load model from {MODEL_PATH}: {e}")
    raise

# === Email Cleaner ===
def extract_clean_email(email_str):
    email_regex = r'(?:mailto:)?([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)'
    match = re.search(email_regex, email_str)
    return match.group(1) if match else email_str

# === Prompt Generators ===
def make_prompt(text):
    try:
        template_path = os.path.join(os.path.dirname(__file__), "prompt_template.txt")
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
        return template.replace("{{cv_text}}", text.strip()[:MAX_INPUT_LENGTH])
    except Exception as e:
        logging.error(f"❌ Failed to load prompt template: {e}")
        raise

def load_fallback_prompt(cv_text):
    try:
        template_path = os.path.join(os.path.dirname(__file__), "prompt_fallback.txt")
        with open(template_path, 'r', encoding='utf-8') as f:
            template = f.read()
        return template.replace("{{cv_text}}", cv_text.strip()[:MAX_INPUT_LENGTH])
    except Exception as e:
        logging.error(f"❌ Failed to load fallback prompt: {e}")
        raise

# === Fallback to OpenAI ===
def fallback_to_openai(cv_text):
    prompt = load_fallback_prompt(cv_text)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        content = response['choices'][0]['message']['content']
        return json.loads(content)
    except Exception as e:
        logging.error(f"❌ OpenAI fallback failed: {e}")
        return None

# === Sensitive Info Redaction ===
def remove_sensitive_info(content, sensitive_data):
    for value in sensitive_data.values():
        if value:
            content = re.sub(re.escape(value), "[REDACTED]", content, flags=re.IGNORECASE)
    return content

# === Strip Markdown Email Syntax ===
def clean_email_format(text):
    email_pattern = r'\[([^\]]+@[^\]]+)\]\(mailto:[^\)]+\)'
    return re.sub(email_pattern, r'\1', text)

# === File Processing Pipeline ===
def run_llm_on_txt_file(txt_path):
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if not content.strip():
            logging.warning(f"⚠️ Empty file skipped: {txt_path}")
            return

        prompt = make_prompt(content)
        static_prompt = make_prompt("")

        prompt_tokens = len(llm.tokenize(prompt))
        static_tokens = len(llm.tokenize(static_prompt))
        cv_tokens = len(llm.tokenize(content.strip()[:MAX_INPUT_LENGTH]))

        print(f"🔹 Total prompt tokens: {prompt_tokens}")
        print(f"🧱 Static prompt tokens: {static_tokens}")
        print(f"📄 CV content tokens: {cv_tokens}")
        logging.info(f"🧾 Token breakdown: total={prompt_tokens}, static={static_tokens}, cv={cv_tokens}")

        if prompt_tokens > llm.context_length:
            print(f"⚠️ Warning: prompt exceeds context length ({llm.context_length} tokens)")
            logging.warning("⚠️ Prompt exceeds context length!")

        # === Try Local LLM Inference ===
        try:
            start_time = time.time()
            result = llm(prompt, max_new_tokens=MAX_NEW_TOKENS, temperature=0.2)
            end_time = time.time()
        except Exception as e:
            logging.error(f"❌ Local LLM failed: {e}")
            print("⚠️ Local LLM failed. Falling back to OpenAI...")
            fallback_data = fallback_to_openai(content)
            if fallback_data:
                out_path = txt_path.replace("_text.txt", "_sensitive_info.json")
                with open(out_path, 'w', encoding='utf-8') as f:
                    json.dump(fallback_data, f, indent=2)
                print(f"🤖 Fallback saved ➜ {out_path}")
            else:
                print("❌ Fallback also failed.")
            return

        duration = end_time - start_time
        output_tokens = len(llm.tokenize(result))
        total_used = prompt_tokens + output_tokens

        print(f"📤 Output tokens generated: {output_tokens}")
        print(f"📊 Total used tokens: {total_used} / {llm.context_length}")
        print(f"⏱️ Inference time: {duration:.2f} seconds")
        logging.info(f"📤 Output tokens: {output_tokens}")
        logging.info(f"📊 Total used tokens: {total_used} / {llm.context_length}")
        logging.info(f"⏱️ Inference time: {duration:.2f}s")

        # === Save Raw Output ===
        out_path = txt_path.replace("_text.txt", "_sensitive_info.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"🤖 Saved ➜ {out_path}")

        # === Cleaned Output ===
        try:
            cleaned_result = clean_email_format(result)
            sensitive_data = json.loads(cleaned_result)

            if "email" in sensitive_data:
                sensitive_data["email"] = extract_clean_email(sensitive_data["email"])

            cleaned_content = remove_sensitive_info(content, sensitive_data)
            cleaned_txt_path = txt_path.replace("_text.txt", "_cleaned.txt")
            with open(cleaned_txt_path, 'w', encoding='utf-8') as f:
                f.write(cleaned_content)

            logging.info(f"🧹 Cleaned file saved: {cleaned_txt_path}")
            print(f"🧹 Cleaned ➜ {cleaned_txt_path}")
        except Exception as e:
            logging.warning(f"⚠️ Failed to cresate cleaned file: {e}")

    except Exception as e:
        logging.error(f"❌ LLM processing failed for {txt_path}: {e}")
        print(f"❌ Failed to process {txt_path}")
