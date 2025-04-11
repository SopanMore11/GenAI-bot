import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileAttach?: (file: File) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  allowFileAttachments?: boolean;
}

export default function ChatInput({ 
  onSendMessage,
  onFileAttach,
  isLoading = false,
  placeholder = "Type your message...",
  allowFileAttachments = false
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || isPending) return;
    
    onSendMessage(message);
    setMessage("");
    
    // Focus the textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check if it's a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are supported for now.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 10 MB.",
        variant: "destructive"
      });
      return;
    }
    
    // If there's an onFileAttach callback, call it
    if (onFileAttach) {
      try {
        setIsPending(true);
        await onFileAttach(file);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsPending(false);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-dark-lightest bg-dark-lighter">
      <div className="relative max-w-5xl mx-auto">
        <div className="relative rounded-lg bg-dark overflow-hidden shadow-lg border border-dark-lightest focus-within:border-primary/70">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[200px] p-3 pr-20 resize-none bg-dark border-0 focus:ring-0 placeholder:text-gray-500"
            disabled={isLoading || isPending}
          />
          
          <div className="absolute bottom-1.5 right-1.5 flex space-x-1">
            {allowFileAttachments && onFileAttach && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleAttachFile}
                disabled={isLoading || isPending}
                className="h-8 w-8 rounded-full hover:bg-dark-lightest text-gray-400 hover:text-primary"
                title="Attach PDF"
              >
                <i className="ri-attachment-2 text-lg"></i>
              </Button>
            )}
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || isLoading || isPending}
              className={`h-8 w-8 rounded-full bg-primary hover:bg-primary-light transition-colors ${
                (!message.trim() || isLoading || isPending) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading || isPending ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <i className="ri-send-plane-fill text-base"></i>
              )}
            </Button>
          </div>
        </div>
        
        {/* File input hidden */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading || isPending}
        />
        
        {/* Typing indicator */}
        <div className="mt-2 text-xs text-gray-500 px-1 flex items-center justify-between">
          <div>
            {isPending && <span>Uploading file...</span>}
            {!isPending && allowFileAttachments && <span>Attach PDFs to discuss or analyze</span>}
          </div>
          <div>
            <span className="text-gray-600">Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </form>
  );
}