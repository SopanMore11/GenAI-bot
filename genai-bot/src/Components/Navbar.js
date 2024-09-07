import Link from "next/link"

export default function Navbar() {
    return (
    <nav className="flex px-4 py-2 shadow flex-row justify-between items-center">
        <div className="text-xl font-bold">GenAI Bot</div>
        <div>
            <Link href="/login">Login</Link>
        </div>
      </nav>
    )
}