from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.description_routes import router as description_router
from routes.candidate_routes import router as candidate_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adapte selon tes besoins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(description_router)
app.include_router(candidate_router)

# Pour lancer : uvicorn main:app --reload --port 5001