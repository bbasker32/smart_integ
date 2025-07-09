import os
import json
from dotenv import load_dotenv
from docx import Document
import google.generativeai as genai

# === Setup paths ===
current_dir = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '.env'))
prompt_path = os.path.join(current_dir, "your_prompt2.txt")
jdf_path = os.path.join(current_dir, "JDF.docx")
output_folder = os.path.join(current_dir, "api_output_gemini")

# === Load .env ===
load_dotenv(env_path)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file!")

genai.configure(api_key=gemini_api_key)

# === Load prompt template ===
with open(prompt_path, "r", encoding="utf-8") as f:
    structuring_prompt = f.read()

# === Load job description from DOCX ===
doc = Document(jdf_path)
jdf_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])


def structure_with_gemini(cleaned_text):
    """Send cleaned text + prompt to Gemini and return structured output."""
    model = genai.GenerativeModel("gemini-2.0-flash")

    final_prompt = f"""{structuring_prompt}

CV:
{cleaned_text}

Job Description:
{jdf_text}
"""

    response = model.generate_content(
        final_prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=3000,
        )
    )

    return response.text


def save_structured_result(file_path, structured_data):
    """Try to save structured Gemini output as JSON if valid, else save raw text."""
    base_name = os.path.basename(file_path)
    name_without_ext = os.path.splitext(base_name)[0]
    os.makedirs(output_folder, exist_ok=True)

    # Clean markdown-style ```json code blocks
    structured_text = structured_data.strip()
    if structured_text.startswith("```json"):
        structured_text = structured_text[7:].strip()
    if structured_text.endswith("```"):
        structured_text = structured_text[:-3].strip()

    json_path = os.path.join(output_folder, f"{name_without_ext}_structured.json")
    raw_path = os.path.join(output_folder, f"{name_without_ext}_structured_raw.txt")

    try:
        parsed = json.loads(structured_text)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
        print(f"✅ Gemini structured output saved as JSON ➔ {json_path}")
    except Exception as e:
        with open(raw_path, "w", encoding="utf-8") as f:
            f.write(structured_data)
        print(f"⚠️ Gemini output not valid JSON. Raw saved ➔ {raw_path} | Error: {e}")
