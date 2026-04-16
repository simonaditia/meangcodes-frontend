import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content, className = "" }) {
  return (
    <ReactMarkdown className={className} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {content || ""}
    </ReactMarkdown>
  );
}
