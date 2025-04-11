from fastapi import APIRouter, HTTPException
from app.models.schemas import ErrorDecoderRequest, ChatResponse
from app.services.ai_service import ai_service
import uuid

router = APIRouter()

@router.post("/error-decoder", response_model=ChatResponse)
async def error_decoder(request: ErrorDecoderRequest):
    """Handle error decoding requests"""
    try:
        # Get response from AI service
        response = await ai_service.decode_error(
            error_message=request.error_message,
            language=request.language
        )
        
        # Generate a unique ID for the response
        response_id = str(uuid.uuid4())
        
        return ChatResponse(
            id=response_id,
            content=response["content"],
            conversation_id=response_id  # Using the same ID for simplicity
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))