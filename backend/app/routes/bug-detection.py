from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ast

router = APIRouter()

# Request model for the bug detection input
class BugDetectionRequest(BaseModel):
    code: str

# Response model for the bug detection output
class BugDetectionResponse(BaseModel):
    bugs: list

# Utility function for detecting bugs in the provided code
def detect_bugs(code: str):
    bugs = []
    try:
        # Parse the code to check for syntax errors
        ast.parse(code)
    except SyntaxError as e:
        # Capture syntax errors and add them to the bugs list
        bugs.append({
            "bug_type": "SyntaxError",
            "description": str(e),
            "line": e.lineno
        })
    
    # Example logic for additional bug detection
    if " +" in code and "str" in code:
        bugs.append({
            "bug_type": "TypeError",
            "description": "+ operator cannot be used with str and int types.",
            "line": code.count('\n', 0, code.index(" + ")) + 1  # Approximate line number
        })

    return bugs

@router.post("/bug-detection", response_model=BugDetectionResponse)
async def bug_detection(request: BugDetectionRequest):
    # Call the bug detection utility
    bugs = detect_bugs(request.code)
    return BugDetectionResponse(bugs=bugs)
