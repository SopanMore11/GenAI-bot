import uvicorn

if __name__ == "__main__":
    # Start the FastAPI application with uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",  # Use 0.0.0.0 to make it accessible from outside
        port=8000,
        reload=True  # Enable hot reloading for development
    )