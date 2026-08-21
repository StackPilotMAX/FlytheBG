"use client";

export function HoverFaqList({ items }: { items: readonly (readonly [string, string])[] }) {
  const supportsHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <div className="faqList animatedFaqList">
      {items.map(([question, answer]) => (
        <details
          key={question}
          onMouseEnter={(event) => { if (supportsHover()) event.currentTarget.open = true; }}
          onMouseLeave={(event) => { if (supportsHover()) event.currentTarget.open = false; }}
        >
          <summary>{question}<span>+</span></summary>
          <div className="faqAnswer"><p>{answer}</p></div>
        </details>
      ))}
    </div>
  );
}
