from fastapi import FastAPI, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from logic.genai_request import get_response
from fastapi.responses import JSONResponse
from logic.document_loaders import DocumentLoader
from logic.conversation_retrieval import *
from langchain_core.messages import AIMessage, HumanMessage
from pathlib import Path

app = FastAPI()
chain = None
chain_link = None
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# For Receiving the Link to Upload
@app.post("/get-link")
async def get_link(request:Request):
    global chain_link
    data = await request.json()
    input_link = data.get("input_link")
    print(input_link)

    loader = DocumentLoader(chunk_size=1000, chunk_overlap=100)
    print("Loading Website content....")
    docs = loader.web_base_loader(input_link)
    vectorstore_chain = create_db(docs)
    print('Vectorizing the content....')
    chain_link = create_chain(vectorstore_chain)
    return {"res" : "Link Recieved Successfully"}

# For Receiving the input File to upload
@app.post("/get-file")
async def get_file(file:UploadFile):
    global chain
    try:
        UPLOAD_DIR = Path.cwd() / "uploads"
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        data = await file.read()
        file_location = UPLOAD_DIR / file.filename
        print(file.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(data)
        print(file_location)
        loader = DocumentLoader(chunk_size=1000, chunk_overlap=100)
        print("Loading File content....")
        docs = loader.load_pdf(file_location)
        print("File Loaded")
        vectorstore = create_db(docs=docs)
        print("Vectorizing the content")
        chain = create_chain(vectorstore=vectorstore)
        return {"res": "File uploaded and processed successfully"}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"message":"file failed to upload"})
    

# For chat-with-pdf Funtion
conversation_history_for_file = []
@app.post("/chat-with-file")
async def chat_with_link(request:Request):
    global chain
    data = await request.json()
    user_message = data.get("message")
    print(f"User Message : {user_message}")
    # conversation_history = "\n".join(conversation_history_for_link)
    response = process_chat(chain, user_message, conversation_history_for_file)
    conversation_history_for_file.append(HumanMessage(content=user_message))
    conversation_history_for_file.append(AIMessage(content=response))
    return {"message": response}

# For chat-with-link function
conversation_history_for_link = []
@app.post("/chat-with-link")
async def chat_with_link(request:Request):
    global chain_link
    data = await request.json()
    user_message = data.get("message")
    print(f"User Message : {user_message}")
    # conversation_history = "\n".join(conversation_history_for_link)
    response = process_chat(chain_link, user_message, conversation_history_for_link)
    conversation_history_for_link.append(HumanMessage(content=user_message))
    conversation_history_for_link.append(AIMessage(content=response))
    return {"message": response}


conversation_history_store = []

# For Chat Conversations
@app.post("/get-text")
async def get_text(request:Request):
    data = await request.json()
    user_message = data.get("message")
    conversation_history = "\n".join(conversation_history_store)
    response = get_response(user_message, conversation_history)
    conversation_history_store.append(f"User: {user_message}")
    conversation_history_store.append(f"Assistant : {response.content}")
    return {"message": response.content}

