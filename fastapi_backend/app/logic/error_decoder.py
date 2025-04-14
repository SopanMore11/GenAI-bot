from langchain_groq import ChatGroq
from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()

os.environ['GROQ_API_KEY'] = os.getenv("GROQ_API_KEY")
# llm = ChatGroq(model="gemma2-9b-It")

# def solve_error(user_query):
    # prompt = f"""
    #     "You are a programming assistant specialized in solving errors across various programming languages. 
    #     When given an error message, your task is to identify the language, understand the context of the error, and provide a clear, step-by-step solution. 
    #     Include an explanation of the cause of the error and offer an example to demonstrate the corrected code. 
    #     Ensure the solution is concise, easy to follow, and relevant to the provided error message."
    #     User Error : {user_query}

    # """

#     result = llm.invoke(prompt)
#     return result.content

client = Groq()



def solve_error(user_query):
    prompt = f"""
        "You are a programming assistant specialized in solving errors across various programming languages. 
        When given an error message, your task is to identify the language, understand the context of the error, and provide a clear, step-by-step solution. 
        Include an explanation of the cause of the error and offer an example to demonstrate the corrected code. 
        Ensure the solution is concise, easy to follow, and relevant to the provided error message."
    """
    response = client.chat.completions.create(
        model="gemma2-9b-it",
        messages= [
            {"role" : "system", "content" : prompt},
            {"role" : "user", "content":user_query}
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    print(user_query)
    result = response.choices[0].message
    return result

