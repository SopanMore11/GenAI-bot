import { Link, useLocation } from "wouter";

export default function Sidebar() {
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

  return (
    <aside className="bg-dark-lighter w-full md:w-64 md:flex flex-col hidden md:fixed h-full">
      <div className="p-4 border-b border-dark-lightest">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <i className="ri-robot-2-fill text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Assistant
          </h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/chat" className={getLinkClass("/chat")}>
          <i className="ri-message-3-line text-lg"></i>
          <span>Chat</span>
        </Link>
        <Link href="/chat-pdf" className={getLinkClass("/chat-pdf")}>
          <i className="ri-file-text-line text-lg"></i>
          <span>Chat with PDF</span>
        </Link>
        <Link href="/chat-url" className={getLinkClass("/chat-url")}>
          <i className="ri-links-line text-lg"></i>
          <span>Chat with URL</span>
        </Link>
        <Link href="/error-decoder" className={getLinkClass("/error-decoder")}>
          <i className="ri-error-warning-line text-lg"></i>
          <span>Error Decoder</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-dark-lightest">
        <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest transition-colors">
          <i className="ri-settings-4-line text-lg"></i>
          <span>Settings</span>
        </Link>
        <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-lightest transition-colors">
          <i className="ri-user-line text-lg"></i>
          <span>Account</span>
        </Link>
      </div>
    </aside>
  );
}
