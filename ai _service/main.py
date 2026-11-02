"""
SwasthyaSetu AI - Responsible Healthcare AI & ML Microservices Core
Powered by Python & FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Router Imports
from routers.health_router import router as health_router
from routers.assistant_router import router as assistant_router
from routers.preventive_router import router as preventive_router
from routers.risk_router import router as risk_router
from routers.affordable_router import router as affordable_router
from routers.multilingual_router import router as multilingual_router

app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.VERSION,
    description=(
        "Responsible Healthcare AI/ML microservices for SwasthyaSetu AI. "
        "Provides educational symptom triage, longitudinal preventive telemetry insights, "
        "clinically reviewed risk scoring, geospatial affordable care recommendations, "
        "and Indic multilingual assistance."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits frontend dev server on port 3001 & backend proxy on port 5000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire all Routers
app.include_router(health_router)
app.include_router(assistant_router)
app.include_router(preventive_router)
app.include_router(risk_router)
app.include_router(affordable_router)
app.include_router(multilingual_router)

@app.on_event("startup")
async def startup_event():
    print("=" * 65)
    print(f"  {settings.SERVICE_NAME} (v{settings.VERSION})")
    print(f"  Host: http://{settings.HOST}:{settings.PORT}")
    print(f"  Swagger Docs: http://localhost:{settings.PORT}/docs")
    print(f"  Safety Guardrails: Active (108 Red-Flags & DPDP Consent Enforced)")
    print("=" * 65)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.ENABLE_DEBUG)
