from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatRequest, ChatResponse
from app.services.storage import storage
from app.services.ai_service import ai_service
import uuid

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())
        conversation_id = storage.create_conversation(conversation_id)
        
        conversation_history = storage.get_conversation(conversation_id) or []

        storage.add_message(conversation_id, "user", request.message)


        # Get updated history if your service expects full context
        # updated_history = storage.get_conversation(conversation_id)

        dict_history = [
            {"role": msg.role, "content": msg.content}
            for msg in conversation_history
        ]

        response = await ai_service.chat_completion(
            message=request.message,
            conversation_history=dict_history,
            model=request.model
        )

        print(f"[DEBUG] AI response: {response}")

        ai_message = storage.add_message(conversation_id, "assistant", response.get("content", ""))

        return ChatResponse(
            id=ai_message.id,
            content=ai_message.content,
            conversation_id=conversation_id
        )
    
    except Exception as e:
        print(f"[ERROR] Chat endpoint failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
