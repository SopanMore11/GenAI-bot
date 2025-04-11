"""
Anthropic service integration for the AI Chat application.
This module implements Anthropic's API to power various chat features.
"""
import os
from typing import Optional, Dict, Any, List
from anthropic import Anthropic

class AnthropicService:
    """Service for Anthropic API interactions"""
    
    def __init__(self):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
        self.available_models = [
            "claude-3-7-sonnet-20250219",  # the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
            "claude-3-opus-20240229"
        ]
        
    async def chat_completion(self, 
                            message: str, 
                            conversation_history: List[Dict[str, str]] = None, 
                            model: str = "claude-3-7-sonnet-20250219") -> Dict[str, Any]:
        """
        Generate a chat completion using Anthropic's API
        
        Args:
            message: The user's message to respond to
            conversation_history: Previous messages in the conversation
            model: The Anthropic model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return {
                "content": "Anthropic API key not found. Please set the ANTHROPIC_API_KEY environment variable.",
                "model": model
            }
            
        # Convert conversation history to Anthropic's format
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({
                    "role": role,
                    "content": msg["content"]
                })
                
        # Add the current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=1000,
                messages=messages,
                temperature=0.7
            )
            
            return {
                "content": response.content[0].text,
                "model": model
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
                             model: str = "claude-3-7-sonnet-20250219") -> Dict[str, Any]:
        """
        Analyze document content using Anthropic's API
        
        Args:
            file_path: Path to the document file
            query: The user's query about the document
            model: The Anthropic model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return {
                "content": "Anthropic API key not found. Please set the ANTHROPIC_API_KEY environment variable.",
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
                
            # Create messages with document content and query
            system_message = "You are an AI assistant that analyzes documents. Answer based on the document content only."
            
            response = self.client.messages.create(
                model=model,
                max_tokens=1000,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": f"Document content:\n\n{document_text}\n\nUser query: {query}"
                    }
                ],
                temperature=0.5
            )
            
            return {
                "content": response.content[0].text,
                "model": model
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
                        model: str = "claude-3-7-sonnet-20250219") -> Dict[str, Any]:
        """
        Analyze URL content using Anthropic's API
        
        Args:
            url: The URL to analyze
            query: The user's query about the URL content
            crawl_subpages: Whether to crawl subpages
            model: The Anthropic model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return {
                "content": "Anthropic API key not found. Please set the ANTHROPIC_API_KEY environment variable.",
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
            
            system_message = "You are an AI assistant that analyzes web content. Answer based on the website content provided."
            
            response = self.client.messages.create(
                model=model,
                max_tokens=1000,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": f"Website content from {url}:\n\n{url_content}\n\nUser query: {query}"
                    }
                ],
                temperature=0.5
            )
            
            return {
                "content": response.content[0].text,
                "model": model
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
                         model: str = "claude-3-7-sonnet-20250219") -> Dict[str, Any]:
        """
        Decode and explain error messages using Anthropic's API
        
        Args:
            error_message: The error message to decode
            language: Optional programming language for context
            model: The Anthropic model to use
            
        Returns:
            Dict with response content and metadata
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return {
                "content": "Anthropic API key not found. Please set the ANTHROPIC_API_KEY environment variable.",
                "model": model
            }
            
        try:
            lang_context = f" in {language}" if language else ""
            
            system_message = "You are an AI assistant that explains error messages in simple terms. For each error, explain: 1) What it means, 2) Common causes, and 3) How to fix it."
            
            response = self.client.messages.create(
                model=model,
                max_tokens=1000,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": f"Explain this error message{lang_context}:\n\n{error_message}"
                    }
                ],
                temperature=0.3  # Lower temperature for more precise explanations
            )
            
            return {
                "content": response.content[0].text,
                "model": model
            }
        except Exception as e:
            return {
                "content": f"Error decoding message: {str(e)}",
                "model": model,
                "error": str(e)
            }

# Initialize global Anthropic service
anthropic_service = AnthropicService()