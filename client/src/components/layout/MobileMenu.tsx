import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const getLinkClass = (path: string) => {
    return `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive(path) 
        ? "bg-primary/10 text-primary-light" 
        : "hover:bg-dark-lightest text-gray-300"
    }`;
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-dark-lighter p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <i className="ri-robot-2-fill text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Assistant
          </h1>
        </div>
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-dark-lightest"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
      </div>
      
      {/* Mobile Menu (hidden by default) */}
      <div className={`mobile-menu fixed md:hidden top-0 left-0 h-full w-64 bg-dark-lighter z-20 ${isOpen ? 'open' : ''}`}>
        <div className="p-4 border-b border-dark-lightest flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <i className="ri-robot-2-fill text-white text-xl"></i>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
          <button 
            onClick={closeMenu}
            className="p-1 rounded-lg hover:bg-dark-lightest"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link href="/chat" className={getLinkClass("/chat")} onClick={closeMenu}>
            <i className="ri-message-3-line text-lg"></i>
            <span>Chat</span>
          </Link>
          <Link href="/chat-pdf" className={getLinkClass("/chat-pdf")} onClick={closeMenu}>
            <i className="ri-file-text-line text-lg"></i>
            <span>Chat with PDF</span>
          </Link>
          <Link href="/chat-url" className={getLinkClass("/chat-url")} onClick={closeMenu}>
            <i className="ri-links-line text-lg"></i>
            <span>Chat with URL</span>
          </Link>
          <Link href="/error-decoder" className={getLinkClass("/error-decoder")} onClick={closeMenu}>
            <i className="ri-error-warning-line text-lg"></i>
            <span>Error Decoder</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest transition-colors" onClick={closeMenu}>
            <i className="ri-settings-4-line text-lg"></i>
            <span>Settings</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest transition-colors" onClick={closeMenu}>
            <i className="ri-user-line text-lg"></i>
            <span>Account</span>
          </Link>
        </nav>
      </div>
      
      {/* Mobile Nav Tabs */}
      <div className="md:hidden px-4 py-2 overflow-x-auto whitespace-nowrap bg-dark-lighter border-b border-dark-lightest">
        <Link href="/chat" 
          className={`px-4 py-2 font-medium ${isActive("/chat") ? "text-primary-light border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}>
          Chat
        </Link>
        <Link href="/chat-pdf" 
          className={`px-4 py-2 font-medium ${isActive("/chat-pdf") ? "text-primary-light border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}>
          PDF
        </Link>
        <Link href="/chat-url" 
          className={`px-4 py-2 font-medium ${isActive("/chat-url") ? "text-primary-light border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}>
          URL
        </Link>
        <Link href="/error-decoder" 
          className={`px-4 py-2 font-medium ${isActive("/error-decoder") ? "text-primary-light border-b-2 border-primary" : "text-gray-400 hover:text-gray-300"}`}>
          Error
        </Link>
      </div>
    </>
  );
}
