"""
OpenAI service integration for the AI Chat application.
This module implements OpenAI's API to power various chat features.
"""
import os
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")
class GroqServices:
    """Service for OpenAI API interactions"""
    
    def __init__(self):
        self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

        self.available_models = [
            "llama-3.1-8b-instant",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            "deepseek-r1-distill-qwen-32b"
        ]
        
    async def chat_completion(self, 
                            message: str, 
                            conversation_history: List[Dict[str, str]] = None, 
                            model: str = "llama-3.1-8b-instant") -> Dict[str, Any]:
        """
        Generate a chat completion using OpenAI's API
        
        Args:
            message: The user's message to respond to
            conversation_history: Previous messages in the conversation
            model: The OpenAI model to use (default: gpt-4o)
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("OPENAI_API_KEY"):
            return {
                "content": "OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.",
                "model": model
            }
            
        # Convert conversation history to OpenAI's format
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
                
        # Add the current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            return {
                "content": response.choices[0].message.content,
                "model": model,
                "tokens_used": {
                    "prompt": response.usage.prompt_tokens,
                    "completion": response.usage.completion_tokens,
                    "total": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {
                "content": f"Error generating response: {str(e)}",
                "model": model,
                "error": str(e)
            }
            
    async def analyze_document(self, 
                             file_path: str, 
                             query: str,
                             model: str = "llama-3.1-8b-instant") -> Dict[str, Any]:
        """
        Analyze document content using OpenAI's API
        
        Args:
            file_path: Path to the document file
            query: The user's query about the document
            model: The OpenAI model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("GROQ_API_KEY"):
            return {
                "content": "Groq API key not found. Please set the GROQ_API_KEY environment variable.",
                "model": model
            }
            
        try:
            # Simple implementation - read text from file
            # In a production app, you'd want to use a proper PDF parser
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                document_text = f.read()
                
            # Truncate if too long
            if len(document_text) > 12000:  # Rough approximation to stay within token limits
                document_text = document_text[:12000] + "...[truncated]"
                
            # Create prompt with document content and query
            messages = [
                {
                    "role": "system",
                    "content": "You are an AI assistant that analyzes documents. Answer based on the document content only."
                },
                {
                    "role": "user",
                    "content": f"Document content:\n\n{document_text}\n\nUser query: {query}"
                }
            ]
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.5,
                max_tokens=1000
            )
            
            return {
                "content": response.choices[0].message.content,
                "model": model,
                "tokens_used": {
                    "prompt": response.usage.prompt_tokens,
                    "completion": response.usage.completion_tokens,
                    "total": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {
                "content": f"Error analyzing document: {str(e)}",
                "model": model,
                "error": str(e)
            }
            
    async def analyze_url(self, 
                        url: str, 
                        query: str,
                        crawl_subpages: bool = False,
                        model: str = "llama-3.1-8b-instant") -> Dict[str, Any]:
        """
        Analyze URL content using OpenAI's API
        
        Args:
            url: The URL to analyze
            query: The user's query about the URL content
            crawl_subpages: Whether to crawl subpages
            model: The OpenAI model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("OPENAI_API_KEY"):
            return {
                "content": "Groq API key not found. Please set the GROQ_API_KEY environment variable.",
                "model": model
            }
            
        # In a real implementation, you would:
        # 1. Fetch content from the URL
        # 2. Possibly crawl subpages if requested
        # 3. Extract relevant text
        # 4. Use that as context for the AI
        
        try:
            # Placeholder - in a real implementation, fetch actual URL content
            url_content = f"[This would be the content from {url}]"
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an AI assistant that analyzes web content. Answer based on the website content provided."
                },
                {
                    "role": "user",
                    "content": f"Website content from {url}:\n\n{url_content}\n\nUser query: {query}"
                }
            ]
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.5,
                max_tokens=1000
            )
            
            return {
                "content": response.choices[0].message.content,
                "model": model,
                "tokens_used": {
                    "prompt": response.usage.prompt_tokens,
                    "completion": response.usage.completion_tokens,
                    "total": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {
                "content": f"Error analyzing URL: {str(e)}",
                "model": model,
                "error": str(e)
            }
            
    async def decode_error(self, 
                         error_message: str, 
                         language: Optional[str] = None,
                         model: str = "llama-3.1-8b-instant") -> Dict[str, Any]:
        """
        Decode and explain error messages using OpenAI's API
        
        Args:
            error_message: The error message to decode
            language: Optional programming language for context
            model: The OpenAI model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("GROQ_API_KEY"):
            return {
                "content": "OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.",
                "model": model
            }
            
        try:
            lang_context = f" in {language}" if language else ""
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an AI assistant that explains error messages in simple terms. For each error, explain: 1) What it means, 2) Common causes, and 3) How to fix it."
                },
                {
                    "role": "user",
                    "content": f"Explain this error message{lang_context}:\n\n{error_message}"
                }
            ]
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,  # Lower temperature for more precise explanations
                max_tokens=1000
            )
            
            return {
                "content": response.choices[0].message.content,
                "model": model,
                "tokens_used": {
                    "prompt": response.usage.prompt_tokens,
                    "completion": response.usage.completion_tokens,
                    "total": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {
                "content": f"Error decoding message: {str(e)}",
                "model": model,
                "error": str(e)
            }

# Initialize global OpenAI service
groq_service = GroqServices()