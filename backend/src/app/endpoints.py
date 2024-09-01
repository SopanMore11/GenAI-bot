from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from logic.genai_request import get_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

conversation_history_store = []

@app.post("/get-text")
async def get_text(request:Request):
    data = await request.json()
    user_message = data.get("message")
    conversation_history = "\n".join(conversation_history_store)
    response = get_response(user_message, conversation_history)
    conversation_history_store.append(f"User: {user_message}")
    conversation_history_store.append(f"Assistant : {response.content}")
    return {"message": response.content}
