from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from logic.tools.search_tools import search_tool
from dotenv import load_dotenv
import os

load_dotenv()
os.environ['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")


llm = ChatGroq(model='llama-3.1-70b-versatile',
               temperature=0.3)

# llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
tools = [search_tool]
llm_with_tools = llm.bind_tools(tools=tools)

tool_config = {
    'google_search' : search_tool
}
def get_response(input_query):
    system_prompt = f"""
        Your name is Veronica. You are a helpfull assistant designed to ease the work and productivity of Users. You also have the ability to answer to real time questions.
        You have to respond to Every query you receive in a Very Detailed and Accurate manner.
        I am your boss, so you should refer me as a "Boss" every time you respond.
        You are capable of answering general knowledge and factual questions using your vast knowledge base. 
        You have user query and Only call external tools when the question involves real-time information or data that you do not have access to.
        Also You have conversation history so you have to refer it also.
        User Query : {input_query}

        """
    try:
        res = llm_with_tools.invoke(system_prompt)
        if res.content:
            print(res.content)
            return res
        else:
            print("Searching on Google")
            funct_name = res.tool_calls[0]['name']
            print(res.tool_calls)
            args = res.tool_calls[0]['args']['__arg1']
            search_res = tool_config[funct_name].invoke(args)
            
            final_response_prompt = f"""
            You are provided with a user query and relevant Google search results. Your task is to generate a response based on the information found in the search results. 

            Ensure that your answer is accurate and sourced directly from the search results. For each fact or piece of information you use, provide a proper citation in the following format, using only the links to the sources:
            Also References should be clickable links on each new line.

            References:

            [1] First Refernece
            [2] Second Refernece
            [3] Third Refernece
            And so on...
            User Query: {input_query}
            Search Results: {search_res}
            """
            final_out = llm.invoke(final_response_prompt)
            print(final_out.content)
            return final_out
    except Exception as e:
        print(f"ERROR: {e}")
