import os
import re
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import httpx  
import bleach

app = FastAPI()


app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
app.add_middleware(
    CORSMiddleware,
     allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="frontend/templates")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request):
    return templates.TemplateResponse("Chat.html", {"request": request})



@app.post("/api/chat")
async def chat_api(request: Request):
    try:
      
        body = await request.json()
        messages = body.get("messages", [])
        temperature = body.get("temperature", 0.7)

        
        lm_payload = {
            "model": "codellama-13b-instruct", 
            "messages": messages,
            "temperature": temperature,
            "max_tokens": -1,
            "stream": False
        }
        

        async with httpx.AsyncClient(timeout=860.0) as client:
          
            response = await client.post("http://127.0.0.1:1234/v1/chat/completions", json=lm_payload)
            response.raise_for_status() 

           
            lm_response = response.json()

           
            allowed_tags = ["strong", "h2", "h3", "ul", "ol", "li", "br","pre","code"]
            ai_message = bleach.clean(lm_response['choices'][0]['message']['content'], tags=allowed_tags)
        
        # Return the AI-generated message as JSON response
        return JSONResponse(content={"message": ai_message})

    except httpx.HTTPStatusError as http_err:
        return JSONResponse(content={"error": f"HTTP error occurred: {http_err}"}, status_code=500)
    except httpx.RequestError as req_err:
        return JSONResponse(content={"error": f"Request error occurred: {req_err}"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"error": f"An error occurred: {e}"}, status_code=500)