"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-zinc-100/95">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0 text-zinc-100/95">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0 text-zinc-100/95">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="break-all text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <p className="mb-2 mt-3 text-sm font-bold text-white first:mt-0">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="mb-2 mt-3 text-sm font-bold text-white first:mt-0">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="mb-2 mt-3 text-sm font-bold text-white first:mt-0">{children}</p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-violet-500/40 pl-3 text-zinc-400 last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg border border-white/12 bg-[#0d1117] px-3 py-2.5 last:mb-0 [&>code]:m-0 [&>code]:block [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isFence = Boolean(className?.includes("language-"));
    if (isFence) {
      return (
        <code
          className={`font-mono text-[11px] leading-relaxed text-emerald-100/90 ${className ?? ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-white/12 px-1 py-px font-mono text-[11px] text-violet-200/95"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export default function AiAssistantMarkdown({ source }: { source: string }) {
  if (!source.trim()) return null;
  return (
    <div className="text-[13px] wrap-break-word">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
