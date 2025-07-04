import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
GEMINI_model = genai.GenerativeModel("gemini-2.0-flash")

def generate_text(prompt):
    if OPENAI_API_KEY:
        try:
            print("Trying OpenAI API")
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            if GEMINI_API_KEY:
                print("Falling back to Gemini API")
                response = GEMINI_model.generate_content(prompt)
                return response.text
            else:
                raise RuntimeError("Gemini API key not found after OpenAI failure")
    
    elif GEMINI_API_KEY:
        print("Using Gemini API")
        response = GEMINI_model.generate_content(prompt)
        return response.text
    else:
        raise RuntimeError("Aucune clé API trouvée pour Gemini ou OpenAI")

