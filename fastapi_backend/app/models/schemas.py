from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# Chat models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    model: Optional[str] = "gpt-4o"
    file_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    content: str
    conversation_id: str

# PDF Chat models
class ChatPDFRequest(ChatRequest):
    file_id: str

class FileUploadResponse(BaseModel):
    file_id: str
    message: str

class FileMetadata(BaseModel):
    filename: str
    path: str
    uploaded_at: str
    size: int
    content_type: str

# URL Chat models
class ChatURLRequest(ChatRequest):
    url: HttpUrl
    crawl_subpages: Optional[bool] = False

# Error Decoder models
class ErrorDecoderRequest(BaseModel):
    error_message: str
    language: Optional[str] = None

# Message model
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# Conversation model
class Conversation(BaseModel):
    id: str
    messages: List[Message]
    created_at: str
    updated_at: str
    model: Optional[str] = "gpt-4o"