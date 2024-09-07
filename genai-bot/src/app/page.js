"use client";
import Navbar from "@/Components/Navbar";
import Link from "next/link";
import ChatOptions from "@/Components/chatOptions";
// import { createParser } from 'eventsource-parser';

export default function Home() {

  return (
    <div className="flex flex-col h-screen">
      <Navbar></Navbar>
      <Link href={'/chat'}>Go to Chat</Link>
      <ChatOptions></ChatOptions>
    </div>  
  );
}

