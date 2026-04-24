import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

function toPlainText(node) {
  if (typeof node === "string") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child) => toPlainText(child)).join(" ");
  }

  if (React.isValidElement(node)) {
    return toPlainText(node.props.children);
  }

  return "";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MarkdownContent({ content, className = "" }) {
  const headingCountRef = React.useRef({});
  headingCountRef.current = {};

  const headingWithId = React.useCallback((Tag) => {
    return function HeadingRenderer({ children }) {
      const text = toPlainText(children);
      const base = slugify(text) || "section";
      const seen = headingCountRef.current[base] || 0;
      headingCountRef.current[base] = seen + 1;
      const id = seen === 0 ? base : `${base}-${seen + 1}`;

      return <Tag id={id}>{children}</Tag>;
    };
  }, []);

  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h2: headingWithId("h2"),
        h3: headingWithId("h3"),
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
}
