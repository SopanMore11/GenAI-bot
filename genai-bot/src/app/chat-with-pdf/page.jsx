"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/Components/Navbar";
import ChatBox from "@/Components/chatbox";
// import { createParser } from 'eventsource-parser';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [userMessage, setUserMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [inputFile, setInputFile] = useState(null);
  const bottomRef = useRef(null); // To handle automatic scrolling

  const sendFile = async () => {
    console.log(inputFile);
    if (!inputFile) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", inputFile); // File is the key for the input file

      const response = await fetch(`${apiUrl}/get-file`, {
        method: "POST",
        body: formData,
      });
      const res = await response.json();
      console.log(res);
      // if (response.ok) {
      //     console.log("File Uploaded successfully")
      // }
    } catch (error) {
      console.error("Error Sending file", error);
    }
    setInputFile(null);
  };

  const sendRequest = async () => {
    // Update the message history
    const newMessage = { role: "User", content: userMessage };
    const newMessageHistory = [...messageHistory, newMessage];

    setMessageHistory(newMessageHistory);
    setUserMessage("");
    try {
      const response = await fetch(`${apiUrl}/chat-with-file`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      const newBotResponse = { role: "Assistant", content: data.message };
      const newMessage2 = [...newMessageHistory, newBotResponse];
      setMessageHistory(newMessage2);
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
      <div className="w-full max-w-screen-md mx-auto mt-4 flex px-4 mb-4">
        <input
          type="file"
          onChange={(e) => setInputFile(e.target.files[0])}
          className="border text-lg rounded-md p-1 flex-1"
          rows={1}
          placeholder="Upload Your File"
        ></input>
        <button
          onClick={sendFile}
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-24 p-2 ml-2"
        >
          Submit
        </button>
      </div>
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
              ></ChatBox>
            ))}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* Message Input Box */}

      <div className="w-full max-w-screen-md mx-auto flex px-4 mb-4">
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
