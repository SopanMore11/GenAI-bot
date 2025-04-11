import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Markdown } from "@/components/ui/markdown";
import { Message } from "@/lib/api";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export default function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const getContentWithLinks = (content: string) => {
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`);
  };
  
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 max-w-5xl mx-auto",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isSystem && (
        <div className="flex-shrink-0">
          <Avatar className={cn(
            "h-8 w-8 border",
            isUser 
              ? "bg-primary text-white border-primary-light" 
              : "bg-dark-lighter text-white border-dark-lightest"
          )}>
            {isUser ? (
              <i className="ri-user-3-line"></i>
            ) : (
              <i className="ri-robot-line"></i>
            )}
          </Avatar>
        </div>
      )}
      
      {/* Message Content */}
      <div className={cn(
        "flex flex-col space-y-1 max-w-[90%] md:max-w-[80%]",
        isUser ? "items-end" : "items-start",
        isSystem ? "max-w-full mx-auto items-center" : ""
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-3 rounded-lg",
          isUser 
            ? "bg-primary/10 border border-primary/20" 
            : isAssistant 
              ? "bg-dark-lighter border border-dark-lightest" 
              : "bg-gray-800/40 px-3 py-2 text-sm text-gray-400 border border-dark-lightest/50 rounded-full"
        )}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          ) : (
            <div>
              {isSystem ? (
                <div className="text-center">{message.content}</div>
              ) : (
                <Markdown className="prose-sm prose-dark">
                  {message.content}
                </Markdown>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {!isSystem && !isLoading && (
          <div className={cn(
            "text-xs text-gray-500",
            isUser ? "text-right" : "text-left"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}