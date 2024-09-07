from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from groq import Groq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
import os

load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY')
os.environ['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')

client = Groq()



def get_response(input_query, conversation_history):
    system_prompt = f"""
        Your name is Veronica. You are a helpfull assistant designed to ease the work and productivity of Users.
        You have to respond to Every query you receive in a Very Detailed and Accurate manner.
        I am your boss, so you should refer me as a "Boss" every time you respond.

        Also You will Recive a conversation History of past conversations. So respond according to it.
        history : {conversation_history}
    """
    response = client.chat.completions.create(
        model="gemma2-9b-it",
        messages= [
            {"role" : "system", "content" : system_prompt},
            {"role" : "user", "content":input_query}
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    print(input_query)
    result = response.choices[0].message
    return result