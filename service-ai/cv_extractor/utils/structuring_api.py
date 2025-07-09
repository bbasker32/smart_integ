# structuring_api.py (cleaned up)
import os
from dotenv import load_dotenv
import openai
from docx import Document

# === Setup paths ===
current_dir = os.path.dirname(__file__)
env_path = os.path.abspath(os.path.join(current_dir, '..', '..', '..', '.env'))
prompt_path = os.path.join(current_dir, "your_prompt2.txt")
jdf_path = os.path.join(current_dir, "JDF.docx")
output_folder = os.path.join(current_dir, "api_output_openai")

# === Load .env ===
load_dotenv(env_path)
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

# === Load prompt ===
with open(prompt_path, "r", encoding="utf-8") as f:
    prompt_template = f.read()

# === Load job description ===
doc = Document(jdf_path)
jdf_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])

# === OpenAI Structuring Function ===
def structure_with_openai(cleaned_text):
    prompt = f"""{prompt_template}

CV:
{cleaned_text}

Job Description:
{jdf_text}
"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are a smart helpful HR assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=1000,
    )
    return response.choices[0].message.content

def save_structured_result(file_path, structured_data):
    base_name = os.path.basename(file_path)
    name_without_ext = os.path.splitext(base_name)[0]
    output_file = os.path.join(output_folder, f"{name_without_ext}_structured.txt")
    os.makedirs(output_folder, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(structured_data)
