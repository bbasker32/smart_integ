import openai

# Your OpenAI API key
openai.api_key = "YOUR_OPENAI_API_KEY"

# Paths to files
prompt_file_path = "your_prompt.txt"
original_text_file_path = "original_text.txt"

# 1. Read the original text
with open(original_text_file_path, "r", encoding="utf-8") as f:
    original_text = f.read()

# 2. Step 1: Remove sensitive information
remove_sensitive_prompt = "Please detect and remove all sensitive information (name, email, phone, address) from the following text. Replace them with {{NAME}}, {{EMAIL}}, etc."

response_clean = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are an assistant that cleans text."},
        {"role": "user", "content": f"{remove_sensitive_prompt}\n\nText:\n{original_text}"}
    ],
    temperature=0.2,
    max_tokens=3000,
)

# Get the cleaned text
cleaned_text = response_clean['choices'][0]['message']['content']

# Optional: Save cleaned text (if you want)
with open("cleaned_text.txt", "w", encoding="utf-8") as f:
    f.write(cleaned_text)

# 3. Read the prompt for structuring
with open(prompt_file_path, "r", encoding="utf-8") as f:
    prompt_text = f.read()

# 4. Combine the prompt and cleaned text
final_user_message = f"{prompt_text}\n\nHere is the text:\n{cleaned_text}"

# 5. Step 2: Structure the cleaned text
response_structure = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant that structures data."},
        {"role": "user", "content": final_user_message}
    ],
    temperature=0.3,
    max_tokens=3000,
)

# Get the structured data
structured_data = response_structure['choices'][0]['message']['content']

# 6. Print or Save the final structured data
print(structured_data)

# Optional: Save structured data
with open("structured_output.txt", "w", encoding="utf-8") as f:
    f.write(structured_data)
