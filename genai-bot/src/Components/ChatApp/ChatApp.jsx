"use client";
import { useState} from "react";
import ReactMarkdown from 'react-markdown';

const SYSTEM_MESSAGE = "You are a TechBot, a helpful and versatile AI assistant created by TechGiant using state-of-art.";
const ChatApp = () => {
  const [userMessage, setUserMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([
    {role : "System", content : SYSTEM_MESSAGE}
  ])
  const [inputLink, setInputLink] = useState("");

  const senLink = async () => {
    console.log(inputLink)
    try {
      const response = await fetch(
        'http://localhost:8000/get-link', {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({input_link: inputLink})
        });
        const res = await response.json();
        console.log(res)
    } catch (error) {
        console.error("Error Sending Link", error)
    }
    setInputLink("")
  };

  const sendRequest = async () => {

    // Update the message history
    const newMessage = {role : "User", content : userMessage};
    const newMessageHistory = [...messageHistory, newMessage];

    setMessageHistory(newMessageHistory);
    setUserMessage("")
    try {
      const response = await fetch(
        'http://localhost:8000/chat-with-link',{
          method: "POST",
          headers: {
            "content-type":"application/json"
          },
          body: JSON.stringify({message: userMessage})
      });
      const data = await response.json();

      const newBotResponse = {role: "Assistant", content: data.message};
      const newMessage2 = [...newMessageHistory, newBotResponse];
      setMessageHistory(newMessage2);
    } catch (error) {
        console.error("Error in fetching the message", error)
      }
    };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();  // Prevents newline in textarea
      sendRequest();
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <div className="mt-4 w-full max-w-screen-md mx-auto flex px-4 mb-4">
        <textarea 
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          className="border text-lg rounded-md p-1 flex-1" rows={1} 
          placeholder="Enter Your Link">
        </textarea>
        <button
          onClick={senLink} 
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-24 p-2 ml-2">Submit
        </button>
      </div>
      {/* Message History */}
      <div className="flex-1 overflow-y-scroll">
        <div className="w-full max-w-screen-md mx-auto px-4">
          {messageHistory.filter((message) => message.role !== "System")
          .map((message, idx) => (
            <div key={idx} className="mt-3">
              <div className="font-bold">{message.role === "User" ? "You": "TechBot"}</div>
              <div className="text-lg prose">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      
      <div className="w-full max-w-screen-md mx-auto flex px-4 mb-4">
        <textarea 
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="border text-lg rounded-md p-1 flex-1" rows={1} 
          placeholder="Enter You Query">
        </textarea>
        <button
          onClick={sendRequest} 
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-24 p-2 ml-2">Send
        </button>
      </div>
    </div>
  );
}

export default ChatApp;