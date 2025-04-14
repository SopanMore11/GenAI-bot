from langchain_google_genai import  GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts import MessagesPlaceholder
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains import create_retrieval_chain
from langchain_core.messages import HumanMessage, AIMessage

from app.logic.document_loaders import DocumentLoader
import os
from dotenv import load_dotenv
load_dotenv()

os.environ['GROQ_API_KEY'] = os.getenv("GROQ_API_KEY")
os.environ['OPENAI_API_KEY'] = os.getenv("OPENAI_API_KEY")
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
# For Langchain Traces
# os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
# os.environ["LANGCHAIN_TRACKING_V2"] = "true"
# os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT")


def create_db(docs):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(docs, embeddings)
    return vectorstore

def create_chain(vectorstore):
    # llm = ChatOpenAI(
    #     model="gpt-4o-mini",
    #     temperature=0,
    #     max_tokens=None,
    #     timeout=None
    # )
    llm = ChatGroq(model="llama-3.2-90b-vision-preview")
    system_prompt = """
        Your name is Veronica. You are a helpfull assistant designed to ease the work and productivity of Users.
        You have the given and context and user question. You have to answer the user question from the provided context only. If you don't find answer from the context then simply say "There is no answer for this question in the provided context."
        I am your boss, so you should refer me as a "Boss" every time you respond.
        Context : {context}
    """
    prompt = ChatPromptTemplate.from_messages(
        [
            ('system', system_prompt, ),
            MessagesPlaceholder(variable_name='chat_history'),
            ('user', "{input}")
        ]
    )

    chain = create_stuff_documents_chain(
        llm = llm,
        prompt = prompt
    )

    retriever = vectorstore.as_retriever()
    retriever_propmt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name='chat_history'),
        ('user', "{input}"),
        ('user', "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation.")
    ])

    history_aware_retriever = create_history_aware_retriever(
        llm = llm,
        retriever=retriever,
        prompt=retriever_propmt
    )

    retriever_chain = create_retrieval_chain(
        history_aware_retriever,
        chain
    )

    return retriever_chain

def process_chat(chain, question, chat_history):
    response = chain.invoke(
        {
            'chat_history':chat_history,
            'input' : question
        }
    )
    return response['answer']



# if __name__ == '__main__':
#     loader = DocumentLoader(chunk_size=500, chunk_overlap=50)
#     url = "https://cleartax.in/s/budget-2024-highlights"
#     docs = loader.web_base_loader(url)

#     print('Loaded Documents')

#     vectorstore = create_db(docs)

#     print('Vectorization')
#     chain = create_chain(vectorstore)
    
#     chat_history = []

#     while True:
#         user_input = input("You: " )
#         if user_input.lower() == 'exit':
#             break
#         response = process_chat(chain, user_input, chat_history)
#         chat_history.append(HumanMessage(content=user_input))
#         chat_history.append(AIMessage(content=response))
#         print("Assistant:", response)
#         print('---'*10)
#         print(len(chat_history))
#         print('----'*10)