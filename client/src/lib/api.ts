import { apiRequest } from "./queryClient";

// API endpoints - using the Express server which will proxy to FastAPI
// This avoids CORS issues since the frontend and backend are on different ports
export const API_ENDPOINTS = {
  CHAT: `/api/chat`,
  CHAT_PDF: `/api/chat-pdf`,
  CHAT_URL: `/api/chat-url`,
  ERROR_DECODER: `/api/error-decoder`,
  UPLOAD_PDF: `/api/upload-pdf`,
};

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  model?: string;
  file_id?: string;
}

export interface ChatPDFRequest extends ChatRequest {
  file_id: string;
}

export interface ChatURLRequest extends ChatRequest {
  url: string;
  crawl_subpages?: boolean;
}

export interface ErrorDecoderRequest {
  error_message: string;
  language?: string;
}

// Chat API functions
export async function sendChatMessage(data: ChatRequest) {
  const response = await apiRequest("POST", API_ENDPOINTS.CHAT, data);
  return response.json();
}

// PDF Chat API functions
export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(API_ENDPOINTS.UPLOAD_PDF, {
    method: "POST",
    body: formData,
    // No credentials for cross-origin requests to FastAPI
  });
  
  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errorData = await response.json();
      errorText = errorData.detail || errorText;
    } catch (e) {
      try {
        errorText = await response.text();
      } catch (e) {
        // Fallback to status text
      }
    }
    throw new Error(errorText);
  }
  
  return response.json();
}

export async function sendChatPDFMessage(data: ChatPDFRequest) {
  const response = await apiRequest("POST", API_ENDPOINTS.CHAT_PDF, data);
  return response.json();
}

// URL Chat API functions
export async function sendChatURLMessage(data: ChatURLRequest) {
  const response = await apiRequest("POST", API_ENDPOINTS.CHAT_URL, data);
  return response.json();
}

// Error decoder API functions
export async function decodeError(data: ErrorDecoderRequest) {
  const response = await apiRequest("POST", API_ENDPOINTS.ERROR_DECODER, data);
  return response.json();
}
