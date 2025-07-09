from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from services.prompt_generator import generate_prompts
from services.model_service import generate_text

router = APIRouter()

@router.post("/generate-classic")
async def generate_classic(request: Request):
    data = await request.json()
    print("Received data for classic job description generation:", data)
    prompt = generate_prompts(data)["classique"]
    result = generate_text(prompt)
    return JSONResponse(content={"preview": result})

@router.post("/generate-linkedin")
async def generate_linkedin(request: Request):
    profile = await request.json()
    print("Received profile data for LinkedIn generation:", profile)
    try:
        prompts = generate_prompts(profile)
        linkedin = generate_text(prompts["linkedin"] + prompts["classique"])
        return JSONResponse(content={"preview": linkedin})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/generate-indeed")
async def generate_indeed(request: Request):
    profile = await request.json()
    try:
        prompts = generate_prompts(profile)
        indeed = generate_text(prompts["indeed"] + prompts["classique"])
        return JSONResponse(content={"preview": indeed})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)