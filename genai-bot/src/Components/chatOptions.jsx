import Link from "next/link";
import { FaFilePdf, FaLink, FaBug } from "react-icons/fa";

const ChatOptions = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {/* Chat with PDF */}
      <div className="w-80 bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
        <FaFilePdf className="text-red-500 text-4xl mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Chat with PDF</h2>
        <p className="text-gray-600 mb-4">
          Upload a PDF and start an interactive chat about its content.
        </p>
        <Link href="/chat-with-pdf">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
            Start Chat
          </button>
        </Link>
      </div>

      {/* Chat with Link */}
      <div className="w-80 bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
        <FaLink className="text-green-500 text-4xl mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Chat with Link</h2>
        <p className="text-gray-600 mb-4">
          Enter a link to a webpage and chat about its content.
        </p>
        <Link href="/chat-with-link">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
            Start Chat
          </button>
        </Link>
      </div>

      {/* Error Decoder */}
      <div className="w-80 bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
        <FaBug className="text-yellow-500 text-4xl mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Error Decoder</h2>
        <p className="text-gray-600 mb-4">
          Enter your programming error and resolve it quickly.
        </p>
        <Link href="/error-decoder">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
            Start Chat
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ChatOptions;
