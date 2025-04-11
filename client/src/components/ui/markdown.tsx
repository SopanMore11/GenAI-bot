import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  const formattedText = React.useMemo(() => {
    let content = children || "";
    
    // Process code blocks
    content = content.replace(
      /```([a-z]*)\n([\s\S]*?)```/g,
      (_, language, code) => {
        return `<pre class="bg-dark rounded-md p-4 overflow-x-auto"><code class="language-${language || 'text'}">${
          code
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .trim()
        }</code></pre>`;
      }
    );
    
    // Process inline code
    content = content.replace(
      /`([^`]+)`/g,
      '<code class="bg-dark-lightest px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );
    
    // Process headers (h1, h2, h3)
    content = content.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
    content = content.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>');
    content = content.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>');
    
    // Process bold and italic
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Process links
    content = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    );
    
    // Process unordered lists
    content = content.replace(
      /^\s*-\s(.+)$/gm,
      '<li class="ml-4 list-disc">$1</li>'
    );
    content = content.replace(
      /<li class="ml-4 list-disc">(.*?)<\/li>(?!\s*<li)/g,
      '<ul class="my-2">$&</ul>'
    );
    
    // Process ordered lists
    content = content.replace(
      /^\s*(\d+)\.\s(.+)$/gm,
      '<li class="ml-4 list-decimal">$2</li>'
    );
    content = content.replace(
      /<li class="ml-4 list-decimal">(.*?)<\/li>(?!\s*<li)/g,
      '<ol class="my-2">$&</ol>'
    );
    
    // Process blockquotes
    content = content.replace(
      /^\s*>\s(.+)$/gm,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-500">$1</blockquote>'
    );
    
    // Process paragraphs
    content = content.replace(
      /^(?!<[a-z]).+$/gm,
      (match) => {
        if (match.trim() === "") return "";
        return `<p class="mb-2">${match}</p>`;
      }
    );
    
    // Process horizontal rule
    content = content.replace(/^\s*---\s*$/gm, '<hr class="my-4 border-t border-gray-300" />');
    
    return content;
  }, [children]);
  
  return (
    <div
      className={cn("prose prose-invert", className)}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
}