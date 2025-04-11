from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatURLRequest, ChatResponse
from app.services.storage import storage
from app.services.ai_service import ai_service
import uuid

router = APIRouter()

@router.post("/chat-url", response_model=ChatResponse)
async def chat_url(request: ChatURLRequest):
    """Handle chat with URL content"""
    try:
        # Create conversation if it doesn't exist
        conversation_id = request.conversation_id or str(uuid.uuid4())
        conversation_id = storage.create_conversation(conversation_id)
        
        # Get conversation history
        conversation_history = storage.get_conversation(conversation_id) or []
        
        # Add user message to conversation
        storage.add_message(conversation_id, "user", f"URL: {request.url}\nQuestion: {request.message}")
        
        # Get response from AI service
        response = await ai_service.analyze_url(
            url=str(request.url),
            query=request.message,
            crawl_subpages=request.crawl_subpages,
            model=request.model
        )
        
        # Add AI response to conversation
        ai_message = storage.add_message(conversation_id, "assistant", response["content"])
        
        return ChatResponse(
            id=ai_message.id,
            content=ai_message.content,
            conversation_id=conversation_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))