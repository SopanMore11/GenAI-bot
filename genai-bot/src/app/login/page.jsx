"use client";
import Navbar from "@/Components/Navbar"
import Link from "next/link"
import { useState } from "react"

export default function Login() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");


    return (
        <div className="flex flex-col h-screen">
            <Navbar></Navbar>
            <div className="mx-auto max-w-md">
                <div className="border self-center rounded-lg my-8 p-4 m-4">
                    <div className="text-center text-xl font-bold text-gray-600">
                        Log In - Veronica
                    </div>
                    <div className="flex flex-col my-4">
                        <label className="font-medium text-gray-600">Email</label>
                        <input 
                            type="email" 
                            className="border p-2 rounded-md mt-1"
                            placeholder="john@doe.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            className="w-40 border text-sm font-medium px-4 py-2 mt-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        >
                            Send Code
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label className="font-medium text-gray-600">Verification Code</label>
                        <input 
                            type="password" 
                            className="border p-2 rounded-md mt-1"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button
                            className="w-40 border border-blue-600 text-sm font-medium px-4 py-2 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Sign IN
                        </button>
                    </div>
                    <p className="text-gray-600 text-sm prose">
                        {"By signing in, you agree to our "}
                        <Link href="/terms">terms of use</Link>
                        {" and "}
                        <Link href="/privacy">privacy policy</Link>.
                    </p>
                    
                </div>
            </div>
        </div>
    )
}