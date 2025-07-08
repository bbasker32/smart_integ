
import re
import logging

def clean_text(text):
    try:
        logging.info("Cleaning raw text.")
        text = text.replace('\xa0', ' ').replace('\u200b', ' ')
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        logging.error(f"Error during cleaning text: {e}")
        return text

def extract_email(text):
    try:
        logging.info("Extracting email.")
        match = re.search(r'[\w\.-]+@[\w\.-]+', text)
        return match.group(0) if match else None
    except Exception as e:
        logging.error(f"Error extracting email: {e}")
        return None

def extract_phone(text):
    try:
        logging.info("Extracting phone number.")
        match = re.search(r'(\+212|0)([ \d]{8,})', text)
        return match.group(0).strip() if match else None
    except Exception as e:
        logging.error(f"Error extracting phone: {e}")
        return None

def extract_linkedin(text):
    try:
        logging.info("Extracting LinkedIn URL.")
        match = re.search(r'linkedin\.com/in/[\w\-]+', text)
        return match.group(0) if match else None
    except Exception as e:
        logging.error(f"Error extracting LinkedIn: {e}")
        return None

def extract_name(text):
    try:
        logging.info("Extracting name (heuristic: first few lines).")
        lines = text.split('\n')
        for line in lines:
            if line.strip() and not any(x in line.lower() for x in ['email', 'phone', 'linkedin']):
                return line.strip()
        return None
    except Exception as e:
        logging.error(f"Error extracting name: {e}")
        return None

def parse_cv(raw_text):
    try:
        cleaned = clean_text(raw_text)

        return {
            "name": extract_name(cleaned),
            "email": extract_email(cleaned),
            "phone": extract_phone(cleaned),
            "linkedin": extract_linkedin(cleaned),
            "raw_cleaned_text": cleaned
        }
    except Exception as e:
        logging.error(f"Error parsing CV: {e}")
        return {}
