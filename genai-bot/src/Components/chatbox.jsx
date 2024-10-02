import ReactMarkdown from "react-markdown";
export default function ChatBox({ role, content }) {
  const isUser = role === "User";

  return (
    <div className={`mt-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`text-lg prose p-2 rounded-md ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black mx-w-[100%]"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
