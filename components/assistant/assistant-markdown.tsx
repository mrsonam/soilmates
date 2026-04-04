import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

const components: Components = {
  p: ({ children }) => (
    <p className="mb-2.5 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2.5 ml-0.5 list-disc space-y-1.5 pl-4 last:mb-0 marker:text-primary/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2.5 ml-0.5 list-decimal space-y-1.5 pl-4 last:mb-0 marker:text-primary/70">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed [&>p]:mb-0">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-on-surface">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-2 hover:opacity-90"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <p className="mb-2 font-display text-base font-semibold leading-snug">
      {children}
    </p>
  ),
  h2: ({ children }) => (
    <p className="mb-2 mt-3 font-display text-sm font-semibold leading-snug first:mt-0">
      {children}
    </p>
  ),
  h3: ({ children }) => (
    <p className="mb-1.5 mt-2.5 text-sm font-semibold leading-snug first:mt-0">
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-primary/25 pl-3 text-on-surface-variant italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-outline-variant/20" />,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code
          className={`my-2 block overflow-x-auto rounded-lg bg-surface-container/80 px-3 py-2 font-mono text-[0.8rem] ${className ?? ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-surface-container/90 px-1 py-0.5 font-mono text-[0.8rem]"
        {...props}
      >
        {children}
      </code>
    );
  },
};

/**
 * Renders assistant (and similar) copy with calm typography: lists, emphasis, links.
 */
export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="assistant-markdown text-sm leading-relaxed text-on-surface [&_*:first-child]:mt-0">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
