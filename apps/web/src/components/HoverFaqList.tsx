"use client";

import { useState } from "react";

export type FaqItem = readonly [question: string, answer: string];

export function HoverFaqList({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faqList faqHoverList">
      {items.map(([question, answer], index) => {
        const open = openIndex === index;
        return (
          <article
            className={`faqHoverItem ${open ? "open" : ""}`}
            key={question}
            onMouseEnter={() => setOpenIndex(index)}
            onMouseLeave={() => setOpenIndex((current) => current === index ? null : current)}
          >
            <button
              type="button"
              className="faqHoverQuestion"
              aria-expanded={open}
              onClick={() => setOpenIndex((current) => current === index ? null : index)}
            >
              <span>{question}</span>
              <b aria-hidden="true">+</b>
            </button>
            <div className="faqHoverAnswer" aria-hidden={!open}>
              <div><p>{answer}</p></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
