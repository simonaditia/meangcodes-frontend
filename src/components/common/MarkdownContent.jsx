import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

const FALLBACK_MARKDOWN_IMAGE = "https://picsum.photos/seed/meangcodes-markdown/1280/720";

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
        img: ({ src, alt }) => (
          <img
            src={src || FALLBACK_MARKDOWN_IMAGE}
            alt={alt || "Article image"}
            loading="lazy"
            className="my-4 h-auto w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_MARKDOWN_IMAGE;
            }}
          />
        ),
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );
}
