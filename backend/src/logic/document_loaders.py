# Set the user agent for web scraping
import os
os.environ['USER_AGENT'] = 'myagent'

from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentLoader:
    def __init__(self, chunk_size=400, chunk_overlap=20):
        # Initialize the text splitter with the specified chunk size and overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

    def web_base_loader(self, url):
        # Load documents from the web
        loader = WebBaseLoader(url)
        docs = loader.load()

        # Split the loaded documents into chunks
        split_docs = self.splitter.split_documents(docs)
        return split_docs

    def load_pdf(self, file_path):
        # Load PDF documents
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # Split the loaded PDF documents into chunks
        split_docs = self.splitter.split_documents(docs)
        return split_docs

