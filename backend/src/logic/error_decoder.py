from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
load_dotenv()

os.environ['GROQ_API_KEY'] = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.1-8b-instant")

def solve_error(user_query):
    prompt = f"""
        "You are a programming assistant specialized in solving errors across various programming languages. 
        When given an error message, your task is to identify the language, understand the context of the error, and provide a clear, step-by-step solution. 
        Include an explanation of the cause of the error and offer an example to demonstrate the corrected code. 
        Ensure the solution is concise, easy to follow, and relevant to the provided error message."
        User Error : {user_query}

    """

    result = llm.invoke(prompt)
    return result.content

