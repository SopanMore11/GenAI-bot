from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import ChatPDFRequest, ChatResponse, FileUploadResponse
from app.services.storage import storage
from app.services.ai_service import ai_service
import uuid

router = APIRouter()

@router.post("/upload-pdf", response_model=FileUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """Handle PDF uploads"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        
        # Save the file using storage service
        file_id = storage.save_file(
            file_obj=file.file,
            filename=file.filename,
            content_type=file.content_type
        )
        # print(f"Saved file: {file_id} -> {storage.files[file_id].path}")
        file_meta = storage.get_file(file_id)

        if file_meta:
            print("File path:", file_meta.path)
            with open(file_meta.path, "rb") as f:
                content = f.read()
                # You can now process the file content (e.g., parse PDF)
        else:
            print("File not found")

        
        return FileUploadResponse(
            file_id=file_id,
            message=f"File {file.filename} uploaded successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat-pdf", response_model=ChatResponse)
async def chat_pdf(request: ChatPDFRequest):
    """Handle chat with PDF document"""
    try:
        # Check if file exists
        file_metadata = storage.get_file(request.file_id)
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Create conversation if it doesn't exist
        conversation_id = request.conversation_id or str(uuid.uuid4())
        conversation_id = storage.create_conversation(conversation_id)
        
        # Get conversation history
        conversation_history = storage.get_conversation(conversation_id) or []
        
        # Add user message to conversation
        storage.add_message(conversation_id, "user", request.message)
        
        # Get response from AI service
        response = await ai_service.analyze_document(
            file_path=file_metadata.path,
            query=request.message,
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