"use client";

import { useId, useState } from "react";

export function HoverFaqList({ items }: { items: readonly (readonly [string, string])[] }) {
  const listId = useId();
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());
  const supportsHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function setOpen(index: number, open: boolean) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (open) next.add(index);
      else next.delete(index);
      return next;
    });
  }

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="faqList animatedFaqList">
      {items.map(([question, answer], index) => {
        const open = openItems.has(index);
        const panelId = `${listId}-answer-${index}`;
        return (
          <article
            className={`faqItem ${open ? "is-open" : ""}`}
            key={question}
            onMouseEnter={() => { if (supportsHover()) setOpen(index, true); }}
            onMouseLeave={() => { if (supportsHover()) setOpen(index, false); }}
          >
            <button
              className="faqQuestion"
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span>{question}</span>
              <span className="faqPlus" aria-hidden="true">+</span>
            </button>
            <div className="faqAnswerMotion" id={panelId} aria-hidden={!open}>
              <div className="faqAnswerInner"><p>{answer}</p></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
