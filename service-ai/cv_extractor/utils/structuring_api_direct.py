import os
from dotenv import load_dotenv
import openai
from docx import Document

# === Setup paths ===
current_dir = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '.env'))
prompt_path = os.path.join(current_dir, "your_prompt3.txt")
jdf_path = os.path.join(current_dir, "JDF.docx")

# === Load .env ===
load_dotenv(env_path)
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

# === Load prompt and job description ===
with open(prompt_path, "r", encoding="utf-8") as f:
    prompt_template = f.read()

doc = Document(jdf_path)
jdf_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])


def structure_with_openai_direct(cleaned_text):
    """Send cleaned text and job description to OpenAI, return raw response."""
    prompt = f"""{prompt_template}

CV:
{cleaned_text}

Job Description:
{jdf_text}
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a smart helpful HR assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=1000,
    )
    return response.choices[0].message.content
