import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function ChatBox({ role, content, image }) {
  const isUser = role === "User";

  return (
    <div className={`mt-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`text-lg prose p-2 rounded-md ${
          isUser
            ? "bg-blue-500 text-white max-w-[70%]"
            : "bg-gray-200 text-black max-w-[100%]"
        }`}
      >
        {image ? (
          <div className="relative w-64 h-64">
            <Image
              src={image}
              alt="User uploaded"
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
