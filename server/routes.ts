import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import FormData from "form-data";
// import fs from "fs";
import * as fs from 'fs';
import axios from "axios";
import express from "express";

// Define multer file request interface
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}


// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Temporary folder for uploads
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
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
      
      console.log(`File uploaded: ${req.file.originalname}, size: ${req.file.size} bytes`);
      
      const form = new FormData();
      form.append("file", fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      
      // Debug form data
      console.log(`Form data created with file: ${req.file.originalname}`);
      
      // Log request details
      console.log(`Sending request to FastAPI at: http://127.0.0.1:8000/upload-pdf`);
      console.log(`File path: ${req.file.path}`);
      console.log(`File type: ${req.file.mimetype}`);
      
      const fastapiResponse = await axios.post("http://127.0.0.1:8000/upload-pdf", form, {
        headers: {
          ...form.getHeaders(),
          'Accept': 'application/json',
        },
        timeout: 30000,
        validateStatus: null, // Allow any status code
      });
      
      // Log the response status
      console.log(`FastAPI response status: ${fastapiResponse.status}`);
      
      if (fastapiResponse.status >= 400) {
        console.error('FastAPI error response:', fastapiResponse.data);
        throw new Error(`FastAPI returned error ${fastapiResponse.status}: ${JSON.stringify(fastapiResponse.data)}`);
      }
      
      // Success - clean up the temporary file
      fs.unlinkSync(req.file.path);
      
      // Send the response back to the client
      res.json(fastapiResponse.data);
      
    } catch (error: any) {
      console.error("Error in upload-pdf endpoint:", error);
      
      // Clean up the temporary file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to clean up temporary file:", unlinkError);
        }
      }
      
      // Send a more detailed error response
      const errorMessage = error.response?.data?.detail || error.message || "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });
  // Chat with PDF endpoint
  app.post("/api/chat-pdf", express.json(), async (req, res) => {
    try {
      const { message, conversation_id, file_id } = req.body;
      
      if (!message || !file_id) {
        return res.status(400).json({ 
          error: "Message and file_id are required" 
        });
      }
      
      console.log(`Processing chat request for file_id: ${file_id}`);
      console.log(`Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
      console.log(`Conversation ID: ${conversation_id || 'new conversation'}`);
      
      // Forward the request to FastAPI
      const fastapiResponse = await axios.post("http://127.0.0.1:8000/chat-pdf", {
        message: message,
        conversation_id: conversation_id,
        file_id: file_id  // This maps to the document needed by FastAPI
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000, // Longer timeout for AI processing
      });
      
      console.log(`FastAPI response status: ${fastapiResponse.status}`);
      
      // Return the response from FastAPI to the client
      res.json(fastapiResponse.data);
      
    } catch (error: any) {
      console.error("Error in chat-pdf endpoint:", error);
      
      let errorMessage = "Internal server error";
      let statusCode = 500;
      
      // Extract more detailed error information if available
      if (error.response) {
        statusCode = error.response.status;
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ error: errorMessage });
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
