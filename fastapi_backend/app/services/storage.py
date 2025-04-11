from typing import Dict, List, Optional
import os
import shutil
from datetime import datetime
import uuid
from app.models.schemas import Message, Conversation, FileMetadata

# In-memory storage for development
# In production, you would use a proper database
class Storage:
    def __init__(self, upload_dir: str = "uploads"):
        self.conversations: Dict[str, List[Message]] = {}
        self.files: Dict[str, FileMetadata] = {}
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    def get_conversation(self, conversation_id: str) -> Optional[List[Message]]:
        """Get a conversation by ID"""
        return self.conversations.get(conversation_id)
    
    def create_conversation(self, conversation_id: Optional[str] = None) -> str:
        """Create a new conversation"""
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        return conversation_id
    
    def add_message(self, conversation_id: str, role: str, content: str) -> Message:
        """Add a message to a conversation"""
        if conversation_id not in self.conversations:
            self.create_conversation(conversation_id)
        
        message = Message(
            id=str(uuid.uuid4()),
            role=role,
            content=content,
            timestamp=datetime.now().isoformat()
        )
        
        self.conversations[conversation_id].append(message)
        return message
    
    def save_file(self, file_obj, filename: str, content_type: str) -> str:
        """Save an uploaded file and return the file ID"""
        file_id = str(uuid.uuid4())
        file_path = os.path.join(self.upload_dir, f"{file_id}_{filename}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Store file metadata
        self.files[file_id] = FileMetadata(
            filename=filename,
            path=file_path,
            uploaded_at=datetime.now().isoformat(),
            size=file_size,
            content_type=content_type
        )
        
        return file_id
    
    def get_file(self, file_id: str) -> Optional[FileMetadata]:
        """Get file metadata by ID"""
        return self.files.get(file_id)

# Initialize global storage
storage = Storage()