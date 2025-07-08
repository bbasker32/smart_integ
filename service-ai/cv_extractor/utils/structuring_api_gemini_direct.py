import os
from dotenv import load_dotenv
from docx import Document
import google.generativeai as genai

# === Setup paths ===
current_dir = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '.env'))
prompt_path = os.path.join(current_dir, "your_prompt3.txt")
jdf_path = os.path.join(current_dir, "JDF.docx")

# === Load .env ===
load_dotenv(env_path)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file!")

genai.configure(api_key=gemini_api_key)

# === Load prompt and job description (unchanged) ===
with open(prompt_path, "r", encoding="utf-8") as f:
    structuring_prompt = f.read()

doc = Document(jdf_path)
jdf_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])


def structure_with_gemini_direct(cleaned_text):
    """Send cleaned text + job-based prompt to Gemini and return raw structured output."""
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
