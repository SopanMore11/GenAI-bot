"""
This file contains the main AI service router that delegates to specific model implementations.
The actual AI functionality is implemented in the openai_service.py and anthropic_service.py modules.
"""
from typing import Optional, Dict, Any, List
import os
from .openai_service import openai_service
from .anthropic_service import anthropic_service
from .groq_service import groq_service

class AIService:
    """Service that routes AI requests to the appropriate implementation"""
    
    def __init__(self):
        # Initialize properties and combine available models from OpenAI and Anthropic
        self.openai_models = openai_service.available_models
        self.anthropic_models = anthropic_service.available_models
        self.available_models = self.openai_models + self.anthropic_models
        self.groq_models = groq_service.available_models

    
    def _get_service_for_model(self, model: str):
        """
        Returns the appropriate service for the specified model
        """
        if model in self.openai_models:
            return openai_service
        elif model in self.anthropic_models:
            return anthropic_service
        elif model in self.groq_models:
            return groq_service
        else:
            # Default to OpenAI if model not recognized
            return openai_service
    
    async def chat_completion(self, 
                             message: str, 
                             conversation_history: List[Dict[str, str]] = None, 
                             model: str = "gpt-4o") -> Dict[str, Any]:
        """
        Route chat completion to the appropriate service based on the model
        """
        service = self._get_service_for_model(model)
        return await service.chat_completion(message, conversation_history, model)
    
    async def analyze_document(self, 
                              file_path: str, 
                              query: str,
                              model: str = "gpt-4o") -> Dict[str, Any]:
        """
        Route document analysis to the appropriate service based on the model
        """
        service = self._get_service_for_model(model)
        return await service.analyze_document(file_path, query, model)
    
    async def analyze_url(self, 
                         url: str, 
                         query: str,
                         crawl_subpages: bool = False,
                         model: str = "gpt-4o") -> Dict[str, Any]:
        """
        Route URL analysis to the appropriate service based on the model
        """
        service = self._get_service_for_model(model)
        return await service.analyze_url(url, query, crawl_subpages, model)
    
    async def decode_error(self, 
                          error_message: str, 
                          language: Optional[str] = None,
                          model: str = "gpt-4o") -> Dict[str, Any]:
        """
        Route error decoding to the appropriate service based on the model
        """
        service = self._get_service_for_model(model)
        return await service.decode_error(error_message, language, model)

# Initialize global AI service
ai_service = AIService()