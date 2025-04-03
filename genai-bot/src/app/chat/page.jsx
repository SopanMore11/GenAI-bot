"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/Components/Navbar";
import ChatBox from "@/Components/chatbox";
// import { createParser } from 'eventsource-parser';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SYSTEM_MESSAGE =
  "You are a TechBot, a helpful and versatile AI assistant created by TechGiant using state-of-art.";
export default function Home() {
  const [userMessage, setUserMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // To store the selected image
  const [messageHistory, setMessageHistory] = useState([
    { role: "System", content: SYSTEM_MESSAGE },
  ]);
  const bottomRef = useRef(null); // To handle automatic scrolling

  const sendRequest = async () => {
    if (!userMessage && !selectedImage) return;
    // Update the message history
    const newMessage = {
      role: "User",
      content: userMessage,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
    };
    setMessageHistory((prevMessages) => [...prevMessages, newMessage]);
    setUserMessage("");

    const formData = new FormData();
    formData.append("message", userMessage);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    setSelectedImage(null); // clear the selected image after getting the value

    try {
      const response = await fetch(`${apiUrl}/get-text`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      // Append bots response to the message history
      const newBotResponse = { role: "Assistant", content: data.message };
      setMessageHistory((prevMessages) => [...prevMessages, newBotResponse]);
    } catch (error) {
      console.error("Error in fetching the message", error);
    }
  };

  // Automatically scroll to the bottom whenever a new message is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents newline in textarea
      sendRequest();
    }
  };
  return (
    <div className="flex flex-col h-screen">
      <Navbar></Navbar>
      {/* Message History */}
      <div className="flex-1 overflow-y-scroll">
        <div className="w-full max-w-screen-md mx-auto px-4">
          {messageHistory
            .filter((message) => message.role !== "System")
            .map((message, idx) => (
              <ChatBox
                key={idx}
                role={message.role}
                content={message.content}
                image={message.image}
              ></ChatBox>
            ))}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* Message Input Box */}

      <div className="w-full max-w-screen-md mx-auto flex px-4 mb-4">
        {/* Image Upload Button */}
        <label className="cursor-pointer bg-gray-200 border rounded-md p-2 mr-2">
          📷
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
        </label>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="border text-lg rounded-md p-1 flex-1"
          rows={1}
          placeholder="Enter You Query"
        ></textarea>
        <button
          onClick={sendRequest}
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-24 p-2 ml-2"
        >
          Send
        </button>
      </div>
    </div>
  );
}
