"use client";

import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  // Keep answers visually quiet: no headings inside the panel.
  h1: ({ children }) => <p className="font-medium text-fg">{children}</p>,
  h2: ({ children }) => <p className="font-medium text-fg">{children}</p>,
  h3: ({ children }) => <p className="font-medium text-fg">{children}</p>,
  img: () => null,
};

export function Markdown({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <div className={`agent-md text-[14.5px] leading-[1.65] text-muted ${streaming ? "is-streaming" : ""}`}>
      <ReactMarkdown components={components} skipHtml>
        {text}
      </ReactMarkdown>
    </div>
  );
}
