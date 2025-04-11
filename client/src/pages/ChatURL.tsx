import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { Message, sendChatURLMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

export default function ChatURL() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);
  const [crawlSubpages, setCrawlSubpages] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleAnalyzeUrl = async () => {
    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send initial message to process URL
      const response = await sendChatURLMessage({
        message: "Analyze this URL",
        url,
        crawl_subpages: crawlSubpages
      });
      
      // If this is the first message, set conversation ID
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      // Add welcome message
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: response.content || `I've analyzed the content at ${url}. What would you like to know about it?`,
        timestamp: new Date().toISOString()
      }]);
      
      setIsUrlProcessed(true);
      
    } catch (error) {
      console.error("Error analyzing URL:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (content: string) => {
    if (!isUrlProcessed) {
      toast({
        title: "No URL analyzed",
        description: "Please analyze a URL first",
        variant: "destructive"
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await sendChatURLMessage({
        message: content,
        conversation_id: conversationId,
        url
      });
      
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
  
  const handleReset = () => {
    setMessages([]);
    setUrl("");
    setIsUrlProcessed(false);
    setConversationId(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* URL Header */}
        <div className="p-4 border-b border-dark-lightest flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chat with URL</h2>
            <p className="text-sm text-gray-400">
              {isUrlProcessed 
                ? `Currently analyzing: ${url}` 
                : "Enter a website URL to analyze and chat about its contents"}
            </p>
          </div>
          {isUrlProcessed && (
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
        
        {!isUrlProcessed ? (
          <motion.div 
            className="flex-1 p-4 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-md p-6 bg-dark-lighter rounded-xl border border-dark-lightest">
              <h3 className="text-lg font-medium mb-4">Enter Website URL</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url-input" className="block text-sm text-gray-400 mb-1">URL Address</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <i className="ri-global-line text-gray-500"></i>
                    </span>
                    <Input
                      type="url"
                      id="url-input"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-dark border border-dark-lightest rounded-lg py-2 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="crawl-subpages" 
                    checked={crawlSubpages}
                    onCheckedChange={(checked) => setCrawlSubpages(checked === true)}
                    className="bg-dark border-dark-lightest rounded text-primary focus:ring-primary" 
                  />
                  <Label 
                    htmlFor="crawl-subpages" 
                    className="text-sm text-gray-400 cursor-pointer"
                  >
                    Include subpages (crawl the website)
                  </Label>
                </div>
                <Button 
                  onClick={handleAnalyzeUrl}
                  disabled={isLoading}
                  className="w-full py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-white font-medium"
                >
                  {isLoading ? "Analyzing..." : "Analyze URL"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Note: Only public and accessible web pages can be analyzed
                </p>
              </div>
            </div>
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
                    timestamp: new Date().toISOString()
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
              placeholder="Ask a question about the website..."
            />
          </>
        )}
      </main>
    </div>
  );
}
