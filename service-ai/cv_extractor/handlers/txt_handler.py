import os
from cv_extractor.utils.file_utils import save_text_as_txt, log_error, log_info
from cv_extractor.utils.parser import clean_text
from cv_extractor.utils.llm_runner import run_llm_on_txt_file
from cv_extractor.utils.structuring_api import structure_with_openai, save_structured_result  # ✅ OpenAI import
from cv_extractor.utils.structuring_api_gemini import structure_with_gemini  # ✅ Gemini import

def handle_txt(file_path):
    filename = os.path.basename(file_path)
    folder = "output_txt"
    log_info(f"📄 Handling TXT file: {filename}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        if text.strip():
            os.makedirs(folder, exist_ok=True)
            cleaned_text = clean_text(text)
            out_path = os.path.join(folder, os.path.splitext(filename)[0] + "_text.txt")

            try:
                save_text_as_txt(cleaned_text, out_path)
                log_info(f"✅ TXT text saved to: {out_path}")
                print(f"✅ Saved to: {out_path}")
            except Exception as save_err:
                log_error(f"❌ Error saving TXT text for {filename}: {save_err}")
                return

            # === Run LLM postprocessing ===
            try:
                run_llm_on_txt_file(out_path)
            except Exception as llm_err:
                log_error(f"❌ LLM processing failed for {filename}: {llm_err}")
                print(f"⚠️ LLM post-processing failed for {filename}")

            # === NEW: Run Gemini Structuring, Fallback to OpenAI if needed ===
            try:
                cleaned_txt_path = out_path.replace("_text.txt", "_cleaned.txt")  # Get cleaned file path
                if os.path.exists(cleaned_txt_path):
                    with open(cleaned_txt_path, "r", encoding="utf-8") as f:
                        cleaned_content = f.read()

                    if cleaned_content.strip():
                        try:
                            # ✅ Try Gemini first
                            structured_data = structure_with_gemini(cleaned_content)
                            log_info(f"✅ Structured using Gemini API for {filename}")
                        except Exception as gemini_err:
                            log_error(f"⚠️ Gemini structuring failed for {filename}: {gemini_err}")
                            try:
                                # 🔄 Fallback to OpenAI
                                structured_data = structure_with_openai(cleaned_content)
                                log_info(f"✅ Structured using OpenAI API (fallback) for {filename}")
                            except Exception as openai_err:
                                log_error(f"❌ OpenAI structuring also failed for {filename}: {openai_err}")
                                print(f"❌ Could not structure the file: {filename}")
                                return  # Stop processing this file

                        save_structured_result(cleaned_txt_path, structured_data)
                        log_info(f"✅ Structured output saved for {cleaned_txt_path}")
                        print(f"✅ Structured output saved for {cleaned_txt_path}")
                    else:
                        log_info(f"⚠️ Skipped structuring {filename} because cleaned text is empty.")
                else:
                    log_info(f"⚠️ No cleaned file found for structuring: {filename}")
            except Exception as structuring_err:
                log_error(f"❌ Unexpected error during structuring for {filename}: {structuring_err}")
                print(f"⚠️ Structuring post-processing failed for {filename}")

        else:
            log_info(f"⚠️ No text extracted from TXT: {filename}")
            print(f"⚠️ No text extracted from {filename}")

    except Exception as e:
        log_error(f"❌ TXT read error for {filename}: {e}")
        print(f"❌ Failed to process {filename}")
