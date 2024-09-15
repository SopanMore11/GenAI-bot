"use client";
import Navbar from "@/Components/Navbar";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [userQuery, setUserQuery] = useState("");
  const [botResponse, setBotResponse] = useState("");

  const sendRequest = async () => {
    try {
      const response = await fetch(`${apiUrl}/decode-error`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: userQuery }),
      });
      const data = await response.json();

      const newBotResponse = data.message;
      setBotResponse(newBotResponse);
    } catch (error) {
      console.log("Error in fetching the message", error);
    }
  };
  return (
    <div>
      <Navbar></Navbar>
      <div className="w-full max-w-screen-md mx-auto mt-4 flex px-4 mb-4">
        <textarea
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="border text-lg rounded-md p-1 flex-1"
          rows={1}
          placeholder="Enter Your Error"
        ></textarea>
        <button
          onClick={sendRequest}
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-24 p-2 ml-2"
        >
          Submit
        </button>
      </div>
      <div className="flex-1 overflow-y-scroll">
        <div className="w-full max-w-screen-md mx-auto px-4">
            <ReactMarkdown>{botResponse}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
