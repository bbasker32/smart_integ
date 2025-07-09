from fastapi import APIRouter, UploadFile, File, Header, HTTPException, Form
from pathlib import Path
import shutil, uuid, os
from cv_extractor.CvExtractor import process_file

router = APIRouter()

# === Constants ===
PROJECT_ROOT = Path(__file__).resolve().parent
TEMP_DIR = PROJECT_ROOT / "../cv_extractor/temp"
TEMP_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".odt", ".pptx"}

@router.get("/")
async def root():
    return {"status": "ok", "message": "Service is running"}

@router.post("/candidate/received/download_cv_and_return_info")
async def extract_from_uploaded_cv(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    skip_sensitive_information: str = Form("true")
):
    if not authorization:
        raise HTTPException(status_code=401, detail="JWT Token manquant")

    print("="*50)
    print(f"📋 État de skip_sensitive_information:")
    print(f"   → Valeur reçue: {skip_sensitive_information}")
    print(f"   → Type: {type(skip_sensitive_information)}")
    print("="*50)

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    base_name = uuid.uuid4().hex
    temp_path = TEMP_DIR / f"{base_name}{ext}"

    try:
        # Step 1: Save uploaded file to temp
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"📥 Received file: {file.filename} ➜ Saved as: {temp_path}")

        # Step 2: Process file and get merged result
        result = process_file(str(temp_path), skip_sensitive_information)
        if not result:
            raise HTTPException(status_code=500, detail="Merged JSON is empty or processing failed")

        print(f"✅ Returning merged result from handler")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

    finally:
        # Optional: clean up temp and output files
        stem = str(temp_path.with_suffix(""))  # remove extension
        for suffix in [ext, "_text.txt", "_cleaned.txt", "_sensitive_info.json", "_structured.json", "_structured_raw.txt", "_final_merged.json"]:
            try:
                os.remove(f"{stem}{suffix}")
            except Exception:
                pass
