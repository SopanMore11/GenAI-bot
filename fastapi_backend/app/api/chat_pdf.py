import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import ChatPDFRequest, ChatResponse, FileUploadResponse
from app.services.storage import storage
from app.logic.document_loaders import DocumentLoader
from app.logic.conversation_retrieval import create_db, create_chain, process_chat
from pathlib import Path
from typing import Dict, Optional
import uuid

router = APIRouter()
chains: Dict[str, any] = {}

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

@router.post("/upload-pdf", response_model=FileUploadResponse)
async def upload_pdf(file: UploadFile = File(...), conversation_id: Optional[str] = Form(None)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")

        file_id = storage.save_file(file.file, file.filename, file.content_type)
        file_meta = storage.get_file(file_id)

        if file_meta:
            logger.info(f"PDF saved at {file_meta.path}")
            conversation_id = conversation_id or str(uuid.uuid4())
            logger.info(f"Creating new conversation: {conversation_id}")
            storage.create_conversation(conversation_id)

            loader = DocumentLoader(chunk_size=1000, chunk_overlap=100)
            logger.info("Loading PDF content...")
            docs = loader.load_pdf(file_meta.path)
            logger.info("PDF loaded successfully. Creating vectorstore...")
            vectorstore = create_db(docs)
            chains[conversation_id] = create_chain(vectorstore)
            logger.info("Chain created for conversation.")

            return FileUploadResponse(
                file_id=file_id,
                conversation_id=conversation_id,
                message=f"File {file.filename} uploaded and processed successfully"
            )

        raise HTTPException(status_code=500, detail="File processing failed")

    except Exception as e:
        logger.error("Upload PDF failed", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat-pdf", response_model=ChatResponse)
async def chat_pdf(request: ChatPDFRequest):
    try:
        if not request.conversation_id:
            raise HTTPException(status_code=400, detail="Conversation ID is required")

        conversation_id = request.conversation_id

        if conversation_id not in chains:
            raise HTTPException(status_code=404, detail="Conversation not found or document not processed")

        storage.create_conversation(conversation_id)  # idempotent in your case
        conversation_history = storage.get_conversation(conversation_id) or []
        logger.info(f"History for {conversation_id}: {conversation_history}")

        storage.add_message(conversation_id, "user", request.message)
        logger.info(f"Processing message: {request.message}")

        chain = chains[conversation_id]
        if not chain:
            raise HTTPException(status_code=500, detail="Conversation chain is missing.")

        response = process_chat(chain, request.message, conversation_history)
        ai_message = storage.add_message(conversation_id, "assistant", response)

        return ChatResponse(
            id=ai_message.id,
            content=str(ai_message.content) if hasattr(ai_message, 'content') else response,
            conversation_id=conversation_id
        )

    except KeyError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except Exception as e:
        logger.error("Chat PDF processing failed", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
