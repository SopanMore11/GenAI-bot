from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from logic.genai_request import get_response
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.post("/get-text")
async def get_text(request:Request):
    data = await request.json()
    user_message = data.get("message")
    response = get_response(user_message)
    print(response.content)
    return {"message": response.content}
