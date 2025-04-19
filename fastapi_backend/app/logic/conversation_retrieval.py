import os
import logging
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever

from app.utils import convert_to_langchain_messages
from app.logic.document_loaders import DocumentLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
os.environ['GROQ_API_KEY'] = os.getenv("GROQ_API_KEY")
os.environ['OPENAI_API_KEY'] = os.getenv("OPENAI_API_KEY")
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")

# Prompt template
SYSTEM_PROMPT = """
Your name is Veronica. You are a helpful assistant designed to ease the work and productivity of Users.
You are provided with context and the user's question. Answer the user's question based only on the provided context.
If there is no relevant information in the context, reply: "There is no answer for this question in the provided context."
Always refer to the user as "Boss."
Context: {context}
"""

def create_db(docs):
    """Create a FAISS vectorstore from given documents."""
  
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(docs, embeddings)
    logger.info("Vectorstore created successfully.")
    return vectorstore

def create_chain(vectorstore):
    """Build a conversation-aware retrieval and response chain."""
  
    llm = ChatGroq(model="llama-3.1-8b-instant")

    # Create the answering prompt
    response_prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}")
    ])
    response_chain = create_stuff_documents_chain(llm=llm, prompt=response_prompt)

    # Create the retriever prompt
    retriever_prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Given the above conversation, generate a search query to retrieve relevant context.")
    ])

    retriever = vectorstore.as_retriever()
    history_aware_retriever = create_history_aware_retriever(
        llm=llm,
        retriever=retriever,
        prompt=retriever_prompt
    )

    full_chain = create_retrieval_chain(history_aware_retriever, response_chain)

    return full_chain

def process_chat(chain, question: str, chat_history: list):
    """Send message and history to the chain and return the assistant's response."""
    logger.info(f"Processing new message: '{question}'")
    try:
        formatted_history = convert_to_langchain_messages(chat_history)
    
        
        result = chain.invoke({
            "chat_history": formatted_history,
            "input": question
        })

        answer = result.get("answer", "No response generated.")
        logger.info("Response successfully generated.")
        return answer

    except Exception as e:
        logger.error("Error during chain invocation", exc_info=True)
        return "There was an error processing your request. Please try again."
