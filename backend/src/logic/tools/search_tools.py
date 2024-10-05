from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain.agents import Tool
import os
from dotenv import load_dotenv
load_dotenv()

os.environ['SERPER_API_KEY'] = os.getenv('SERPAPI_API_KEY')

# Setup Tools
search = GoogleSerperAPIWrapper(gl='in',k=5)

search_tool = Tool(
    name="google_search",
    func=search.results,
    description="Use this tool ONLY when you need fresh, real-time information that you do not know, such as latest news, current stock prices, or weather updates. Avoid using this tool if you already know the answer."
)

