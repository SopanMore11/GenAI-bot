import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { Message, uploadPDF, sendChatPDFMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function ChatPDF() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (file: File) => {
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    handleFileUpload(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Create a simulated progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const response = await uploadPDF(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set file ID from response
      setFileId(response.file_id);

      // Add welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `I've processed your PDF "${file.name}". What would you like to know about it?`,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Show success toast
      toast({
        title: "Upload successful",
        description: "Your PDF has been uploaded and processed",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your PDF",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!fileId) {
      toast({
        title: "No PDF loaded",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatPDFMessage({
        message: content,
        conversation_id: conversationId,
        file_id: fileId,
      });

      // If this is the first message, set conversation ID
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      // Add AI response
      const aiMessage: Message = {
        id: response.id || uuidv4(),
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setFileId(null);
    setSelectedFile(null);
    setConversationId(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      <Sidebar />
      <MobileMenu />

      <main className="flex-1 md:ml-64 flex flex-col">
        {/* PDF Header */}
        <div className="p-4 border-b border-dark-lightest flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chat with PDF</h2>
            <p className="text-sm text-gray-400">
              {fileId
                ? `Currently analyzing: ${selectedFile?.name}`
                : "Upload a PDF document to analyze and chat about its contents"}
            </p>
          </div>
          {fileId && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg hover:bg-dark-lightest transition-colors"
            >
              <i className="ri-restart-line text-lg text-gray-400"></i>
            </Button>
          )}
        </div>

        {!fileId ? (
          <motion.div
            className="flex-1 p-4 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`file-drop-zone w-full max-w-md p-8 rounded-xl flex flex-col items-center justify-center text-center ${
                isDragging ? "active" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-dark-lightest flex items-center justify-center">
                <i className="ri-file-upload-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Upload PDF Document</h3>
              <p className="text-gray-400 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                id="pdf-upload"
                className="hidden"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files && handleFileSelect(e.target.files[0])
                }
              />
              <Button
                onClick={handleBrowseClick}
                className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-white font-medium"
              >
                Select PDF
              </Button>
              <p className="mt-3 text-xs text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="w-full max-w-md mt-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Uploading {selectedFile?.name}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress
                  value={uploadProgress}
                  className="w-full bg-dark-lightest h-2"
                />
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isLoading && (
                <ChatMessage
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "",
                    timestamp: new Date().toISOString(),
                  }}
                  isLoading={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask a question about the PDF..."
            />
          </>
        )}
      </main>
    </div>
  );
}
