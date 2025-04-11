import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import FeatureCard from "@/components/feature/FeatureCard";
import { motion } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 md:ml-64 flex flex-col">
        <motion.div 
          className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FeatureCard 
            icon="ri-message-3-line"
            iconColor="text-primary-light"
            iconBgColor="bg-primary/20"
            title="Chat"
            description="Ask questions, get instant answers, and have engaging conversations."
            buttonText="Start Chatting"
            onClick={() => navigate("/chat")}
            isPrimary={true}
          />
          
          <FeatureCard 
            icon="ri-file-text-line"
            iconColor="text-secondary-light"
            iconBgColor="bg-secondary/20"
            title="Chat with PDF"
            description="Upload a PDF document and have a conversation about its contents."
            buttonText="Upload PDF"
            onClick={() => navigate("/chat-pdf")}
          />
          
          <FeatureCard 
            icon="ri-links-line"
            iconColor="text-accent-light"
            iconBgColor="bg-accent/20"
            title="Chat with URL"
            description="Provide a website URL and chat about the information it contains."
            buttonText="Enter URL"
            onClick={() => navigate("/chat-url")}
          />
          
          <FeatureCard 
            icon="ri-error-warning-line"
            iconColor="text-[#F59E0B]"
            iconBgColor="bg-[#F59E0B]/20"
            title="Error Decoder"
            description="Paste an error message to get a simplified explanation and potential solutions."
            buttonText="Decode Error"
            onClick={() => navigate("/error-decoder")}
            gridSpan="full"
          />
        </motion.div>
      </main>
    </div>
  );
}
