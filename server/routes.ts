import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";

// Define multer file request interface
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const fastapiRes = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
  
      const data = await fastapiRes.json();
      res.status(fastapiRes.status).json(data);
    } catch (error) {
      console.error("Error proxying to FastAPI:", error);
      res.status(500).json({ error: "Error connecting to AI backend" });
    }
  });
  

  // Upload PDF endpoint
  app.post("/api/upload-pdf", upload.single("file"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Log file information
      console.log(`File uploaded: ${req.file.originalname}, size: ${req.file.size} bytes`);
      
      // Here you would typically process the PDF file
      // For now, return a simulated response with file ID
      res.json({
        file_id: Math.random().toString(36).substring(2, 15),
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error in upload-pdf endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat with PDF endpoint
  app.post("/api/chat-pdf", async (req, res) => {
    try {
      const { message, conversation_id, file_id } = req.body;
      
      if (!message || !file_id) {
        return res.status(400).json({ 
          error: "Message and file_id are required" 
        });
      }
      
      // Here you would typically call your AI service with PDF context
      res.json({
        id: Math.random().toString(36).substring(2, 15),
        content: `I received your message: "${message}" about the PDF document. This is a simulated response. Connect your AI backend to make this functional.`,
        conversation_id: conversation_id || Math.random().toString(36).substring(2, 15),
      });
    } catch (error) {
      console.error("Error in chat-pdf endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat with URL endpoint
  app.post("/api/chat-url", async (req, res) => {
    try {
      const { message, conversation_id, url, crawl_subpages } = req.body;
      
      if (!message || !url) {
        return res.status(400).json({ 
          error: "Message and URL are required" 
        });
      }
      
      // Here you would typically call your AI service with URL context
      res.json({
        id: Math.random().toString(36).substring(2, 15),
        content: `I received your message: "${message}" about the URL ${url}. ${crawl_subpages ? "I'll also crawl subpages." : ""} This is a simulated response. Connect your AI backend to make this functional.`,
        conversation_id: conversation_id || Math.random().toString(36).substring(2, 15),
      });
    } catch (error) {
      console.error("Error in chat-url endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Error decoder endpoint
  app.post("/api/error-decoder", async (req, res) => {
    try {
      const { error_message, language } = req.body;
      
      if (!error_message) {
        return res.status(400).json({ error: "Error message is required" });
      }
      
      // Here you would typically call your AI service for error decoding
      res.json({
        id: Math.random().toString(36).substring(2, 15),
        content: `Here's what might be causing your error:\n\n**Explanation:**\nThe error message you provided appears to be related to ${language || 'a programming issue'}. This is likely happening because of a syntax error or missing dependency.\n\n**Possible Solutions:**\n1. Check your syntax and ensure all brackets/parentheses are properly closed\n2. Verify that all required dependencies are installed\n3. Make sure you're using the correct API version\n\nThis is a simulated response. Connect your AI backend to make this functional.`,
      });
    } catch (error) {
      console.error("Error in error-decoder endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
