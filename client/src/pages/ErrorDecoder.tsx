import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import ChatMessage from "@/components/chat/ChatMessage";
import { Message, decodeError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
];

export default function ErrorDecoder() {
  const [errorText, setErrorText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [response, setResponse] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleDecode = async () => {
    if (!errorText.trim()) {
      toast({
        title: "Empty error message",
        description: "Please enter an error message to decode",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await decodeError({
        error_message: errorText,
        language: language !== "auto" ? language : undefined
      });
      
      setResponse({
        id: uuidv4(),
        role: "assistant",
        content: result.content,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error decoding message:", error);
      toast({
        title: "Decoding failed",
        description: "There was an error decoding your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setErrorText("");
    setLanguage("auto");
    setResponse(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Error Header */}
        <div className="p-4 border-b border-dark-lightest flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Error Decoder</h2>
            <p className="text-sm text-gray-400">Paste an error message to get a simplified explanation</p>
          </div>
          {response && (
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
        
        {!response ? (
          <motion.div 
            className="flex-1 p-4 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-md p-6 bg-dark-lighter rounded-xl border border-dark-lightest">
              <h3 className="text-lg font-medium mb-4">Paste Error Message</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="error-input" className="block text-sm text-gray-400 mb-1">Error Text</Label>
                  <Textarea
                    id="error-input"
                    value={errorText}
                    onChange={(e) => setErrorText(e.target.value)}
                    className="w-full bg-dark border border-dark-lightest rounded-lg p-3 text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-primary h-32"
                    placeholder="Paste your error message here..."
                  />
                </div>
                <div>
                  <Label htmlFor="language-select" className="block text-sm text-gray-400 mb-1">Select Language (Optional)</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full bg-dark border border-dark-lightest rounded-lg py-2 px-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleDecode}
                  disabled={isLoading || !errorText.trim()}
                  className="w-full py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-white font-medium"
                >
                  {isLoading ? "Decoding..." : "Decode Error"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <Label className="block text-sm text-gray-400 mb-2">Your Error Message:</Label>
              <div className="bg-dark p-3 rounded-lg text-gray-300 font-mono text-sm border border-dark-lightest">
                {errorText}
              </div>
            </div>
            
            <Label className="block text-sm text-gray-400 mb-2">Decoded Explanation:</Label>
            {isLoading ? (
              <ChatMessage 
                message={{
                  id: "loading",
                  role: "assistant",
                  content: "",
                  timestamp: new Date().toISOString()
                }}
                isLoading={true}
              />
            ) : (
              <ChatMessage message={response} />
            )}
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleReset}
                variant="outline" 
                className="px-4 py-2 bg-transparent border border-dark-lightest hover:bg-dark-lightest text-gray-300"
              >
                Decode Another Error
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
