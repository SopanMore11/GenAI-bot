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

export interface PdfUploadResponse {
  file_id: string;
  filename: string;
  page_count: number;
  conversation_id: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  model?: string;
  file_id?: string;
}

// Response interfaces
export interface ChatPdfResponse {
  id: string;
  content: string;
  conversation_id: string;
  sources?: {
    page: number;
    text: string;
  }[];
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

// PDF Upload function
export async function uploadPDF(file: File, conversationId?: string): Promise<PdfUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (conversationId) {
    formData.append("conversation_id", conversationId);
  }
  
  const response = await fetch(API_ENDPOINTS.UPLOAD_PDF, {
    method: "POST",
    body: formData,
    // Don't manually set Content-Type header - browser will set it with correct boundary
    // Allow credentials if needed
    credentials: 'include',
  });
  
  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errorData = await response.json();
      errorText = errorData.error || errorData.detail || errorText;
    } catch (e) {
      try {
        errorText = await response.text();
      } catch (e) {
        // Fallback to status text
      }
    }
    throw new Error(`PDF upload failed: ${errorText}`);
  }
  
  return response.json();
}

// export async function sendChatPDFMessage(data: ChatPDFRequest) {
//   const response = await apiRequest("POST", API_ENDPOINTS.CHAT_PDF, data);
//   return response.json();
// }

// PDF Chat function - updated to match FastAPI requirements
export async function sendChatPDFMessage({
    message,
    fileId,
    conversationId,
  }: {
    message: string;
    fileId: string;
    conversationId: string;
  }): Promise<ChatPdfResponse> {
    
  const response = await fetch(API_ENDPOINTS.CHAT_PDF, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      file_id: fileId,
      conversation_id: conversationId
    }),
  });
  
  if (!response.ok) {
    let errorText = response.statusText;
    let responseBody = '';
    
    try {
      // First try to get the response as text
      responseBody = await response.text();
      console.error(`Chat failed with status ${response.status}. Response body:`, responseBody);
      
      // Then try to parse it as JSON if possible
      try {
        const errorData = JSON.parse(responseBody);
        errorText = errorData.error || errorData.detail || errorText;
      } catch (jsonError) {
        // Not JSON, use the text response
        if (responseBody) errorText = responseBody;
      }
    } catch (e) {
      console.error('Failed to read error response body:', e);
      // Fallback to status text
    }
    
    throw new Error(`PDF chat failed (${response.status}): ${errorText}`);
  }
  
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
