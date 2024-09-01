from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
import os

load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY')

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    stream = True,
    temperature=0,
    max_tokens=None,
    timeout=None
)

def get_response(input_query, conversation_history):
    system_prompt = f"""
        Your name is Veronica. You are a helpfull assistant designed to ease the work and productivity of Users.
        You have to respond to Every query you receive in a Very Detailed and Accurate manner.

        Also You will Recive a conversation History of past conversations. So respond according to it.
        history : {conversation_history}
    """

    template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{user_input}")
    ])
    print(input_query)
    prompt = template.invoke(input_query)
    response = llm.invoke(prompt)
    return response