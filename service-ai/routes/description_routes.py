from flask import Blueprint, request, jsonify
from services.prompt_generator import generate_prompts
from services.model_service import generate_text

description_bp = Blueprint("description", __name__)

# service-ai/routes/description_routes.py
@description_bp.route("/generate-classic", methods=["POST"])
def generate_classic():
    data = request.json
    print("Received data for classic job description generation:", data)
    prompt = generate_prompts(data)["classique"]
    result = generate_text(prompt)
    return jsonify({"preview": result})


@description_bp.route("/generate-linkedin", methods=["POST"])
def generate_linkedin():
    profile = request.json
    print("Received profile data for LinkedIn generation:", profile)
    try:
        prompts = generate_prompts(profile)
        linkedin = generate_text(prompts["linkedin"] + prompts["classique"])
        return jsonify({"preview": linkedin})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@description_bp.route("/generate-indeed", methods=["POST"])
def generate_indeed():
    profile = request.json
    try:
        prompts = generate_prompts(profile)
        indeed = generate_text(prompts["indeed"] + prompts["classique"])
        return jsonify({"preview": indeed})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500