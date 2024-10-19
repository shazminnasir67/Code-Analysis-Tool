from fastapi import APIRouter, HTTPException
from app.services.lm_studio_service import analyze_static_code

router = APIRouter()

@router.post("/")
async def static_analysis(code: str):
    result = analyze_static_code(code)
    if result:
        return {"static_analysis_result": result}
    else:
        raise HTTPException(status_code=500, detail="Error analyzing code")
