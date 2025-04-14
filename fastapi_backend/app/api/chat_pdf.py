from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import ChatPDFRequest, ChatResponse, FileUploadResponse
from app.services.storage import storage
from app.services.ai_service import ai_service
from app.logic.document_loaders import DocumentLoader
from app.logic.conversation_retrieval import create_db, create_chain, process_chat
from langchain_core.messages import AIMessage, HumanMessage
from pathlib import Path
from typing import Dict, Optional
import uuid

router = APIRouter()
# Use a dictionary to store chains by conversation_id
chains: Dict[str, any] = {}

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
            # Create a new conversation
            conversation_id = str(uuid.uuid4())
            print(f"Creating File conversation with ID: {conversation_id}")
            storage.create_conversation(conversation_id)
            
            loader = DocumentLoader(chunk_size=1000, chunk_overlap=100)
            print("Loading PDF content....")
            docs = loader.load_pdf(file_meta.path)
            print("File Loaded")
            vectorstore = create_db(docs=docs)
            print("Vectorizing the content")
            chains[conversation_id] = create_chain(vectorstore=vectorstore)
            print("Chain created")
            
            return FileUploadResponse(
                file_id=file_id,
                conversation_id=conversation_id,
                message=f"File {file.filename} uploaded and processed successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="File processing failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat-pdf", response_model=ChatResponse)
async def chat_pdf(request: ChatPDFRequest):
    """Handle chat with PDF document"""
    try:
        # Get or create conversation
        conversation_id = request.conversation_id or str(uuid.uuid4())
        print(f"Conversation ID: {conversation_id}")
        
        # Check if the conversation exists and has a chain
        if not conversation_id or (request.conversation_id and conversation_id not in chains):
            raise HTTPException(status_code=404, detail="Conversation not found or document not processed")
            
        # Create conversation if it doesn't exist
        storage.create_conversation(conversation_id)
        
        # Get conversation history
        conversation_history = storage.get_conversation(conversation_id) or []
        
        # Add user message to conversation
        storage.add_message(conversation_id, "user", request.message)
        
        # Use the chain associated with this conversation
        chain = chains[conversation_id]
        response = process_chat(chain, request.message, conversation_history)
        
        # Add AI response to conversation
        ai_message = storage.add_message(conversation_id, "assistant", response)
        
        return ChatResponse(
            id=ai_message.id,
            content=str(ai_message.content) if hasattr(ai_message, 'content') else response,
            conversation_id=conversation_id
        )
    
    except KeyError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))