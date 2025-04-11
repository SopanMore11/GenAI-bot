from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, chat_pdf, chat_url, error_decoder

# Create the FastAPI app
app = FastAPI(
    title="AI Assistant API",
    description="API for AI-powered chat, PDF analysis, URL analysis, and error decoding",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers from API modules
app.include_router(chat.router, tags=["Chat"])
app.include_router(chat_pdf.router, tags=["Chat with PDF"])
app.include_router(chat_url.router, tags=["Chat with URL"])
app.include_router(error_decoder.router, tags=["Error Decoder"])

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Welcome to the AI Assistant API"}

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}