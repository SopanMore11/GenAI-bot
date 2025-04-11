import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ChatSettings from "@/components/chat/ChatSettings";
import { Message, sendChatMessage, uploadPDF } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today? You can ask me questions, chat about a PDF document, discuss a website, or decode an error message.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [attachedFileId, setAttachedFileId] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Default model from our FastAPI backend models
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [chatSettings, setChatSettings] = useState({
    streamResponses: true,
    enhancedContext: true,
    preventRepetition: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: attachedFileName 
        ? `[Discussing file: ${attachedFileName}] ${content}`
        : content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Include file_id if we have an attached file
      const requestData: any = {
        message: content,
        conversation_id: conversationId,
        model: selectedModel
      };
      
      if (attachedFileId) {
        requestData.file_id = attachedFileId;
      }
      
      const response = await sendChatMessage(requestData);
      
      // If this is the first message, set conversation ID
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: response.id || uuidv4(),
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileAttach = async (file: File) => {
    try {
      const response = await uploadPDF(file);
      
      if (response.file_id) {
        setAttachedFileId(response.file_id);
        setAttachedFileName(file.name);
        
        // Notify the user
        toast({
          title: "File attached",
          description: `${file.name} is now available for reference in your conversation.`,
        });
        
        // Add a system message about the file attachment
        const systemMessage: Message = {
          id: uuidv4(),
          role: "system",
          content: `File attached: ${file.name}. You can now discuss this document with the AI.`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error; // Re-throw to be handled by the ChatInput component
    }
  };
  
  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today? You can ask me questions, chat about a PDF document, discuss a website, or decode an error message.",
        timestamp: new Date().toISOString()
      }
    ]);
    setConversationId(undefined);
    setAttachedFileId(null);
    setAttachedFileName(null);
  };

  const handleSettingsChange = (key: string, value: boolean) => {
    setChatSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const removeAttachedFile = () => {
    setAttachedFileId(null);
    setAttachedFileName(null);
    
    // Add a system message about removing the file
    const systemMessage: Message = {
      id: uuidv4(),
      role: "system",
      content: "File has been detached from the conversation.",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-dark-lightest flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">AI Assistant Chat</h2>
              <Badge className="ml-2 bg-primary/80 text-xs py-0.5">
                {selectedModel === "gpt-4o" ? "GPT-4o" : 
                 selectedModel === "gpt-3.5-turbo" ? "GPT-3.5" : 
                 selectedModel === "claude-3-7-sonnet-20250219" ? "Claude 3.7" : 
                 selectedModel === "claude-3-opus-20240229" ? "Claude 3 Opus" :
                 selectedModel}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">Ask me anything or try the other features</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleReset}
              variant="ghost" 
              size="icon" 
              className="p-2 rounded-lg hover:bg-dark-lightest transition-colors"
              title="Reset conversation"
            >
              <i className="ri-restart-line text-lg text-gray-400"></i>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="p-2 rounded-lg hover:bg-dark-lightest transition-colors"
              onClick={() => setSettingsOpen(true)}
              title="Chat settings"
            >
              <i className="ri-settings-4-line text-lg text-gray-400"></i>
            </Button>
          </div>
        </div>
        
        {/* Attached File Indicator */}
        {attachedFileName && (
          <div className="px-4 py-2 bg-dark-lighter border-b border-dark-lightest flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-file-line text-primary mr-2"></i>
              <span className="text-sm">File attached: {attachedFileName}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full p-0 text-gray-500 hover:text-white"
              onClick={removeAttachedFile}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        )}
        
        {/* Chat Messages */}
        <motion.div 
          className="flex-1 p-4 overflow-y-auto space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <ChatMessage 
              message={{
                id: "loading",
                role: "assistant",
                content: "",
                timestamp: new Date().toISOString()
              }}
              isLoading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </motion.div>
        
        {/* Chat Input */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onFileAttach={handleFileAttach}
          isLoading={isLoading} 
          allowFileAttachments={true}
        />
      </main>
      
      {/* Settings Dialog */}
      <ChatSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        settings={chatSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
