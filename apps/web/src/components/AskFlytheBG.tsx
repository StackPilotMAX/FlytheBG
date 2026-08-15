"use client";

import { useState, type CSSProperties } from "react";

type PromptKey = "how" | "privacy" | "quality";

const answers: Record<PromptKey, { title: string; body: string; href: string; action: string }> = {
  how: {
    title: "How does removal work?",
    body: "Upload PNG, JPEG, or WebP. FlytheBG validates the file, sends it over the private service network, runs the cutout model, and returns a transparent PNG.",
    href: "#remove",
    action: "Try background removal",
  },
  privacy: {
    title: "What happens to my image?",
    body: "Raw image bytes are processed for your request and are not written to the PostgreSQL run-metadata database. Anonymous run metadata expires in under one hour.",
    href: "/privacy",
    action: "Read Privacy & AI",
  },
  quality: {
    title: "How does FlytheBG improve?",
    body: "Optional feedback can adjust bounded aggregate edge calibration. The production service does not silently add your raw photo to a training-image archive.",
    href: "#story",
    action: "See the quality loop",
  },
};

export function AskFlytheBG({ lift }: { lift: number }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PromptKey>("how");
  const answer = answers[active];
  const style = { "--ask-lift": lift } as CSSProperties;

  return (
    <aside className={`askDock${open ? " isOpen" : ""}`} style={style} aria-label="Ask FlytheBG">
      <div className="askPanel" aria-hidden={!open}>
        <div className="askPanelTop">
          <span className="askIdentity"><img src="/brand/flythebg-mark.svg" alt="" width="30" height="30" /><span><b>Ask FlytheBG</b><small>Product guide · no account</small></span></span>
          <button type="button" className="askClose" onClick={() => setOpen(false)} aria-label="Close Ask FlytheBG">×</button>
        </div>
        <div className="askWelcome">
          <span className="askPulse" />
          <p>Ask about removal, privacy, or how the adaptive quality loop works.</p>
        </div>
        <div className="askChoices" aria-label="Common questions">
          <button className={active === "how" ? "active" : ""} onClick={() => setActive("how")}>How it works</button>
          <button className={active === "privacy" ? "active" : ""} onClick={() => setActive("privacy")}>Image privacy</button>
          <button className={active === "quality" ? "active" : ""} onClick={() => setActive("quality")}>AI quality</button>
        </div>
        <div className="askAnswer" aria-live="polite">
          <span>FLYTHEBG ANSWER</span>
          <h3>{answer.title}</h3>
          <p>{answer.body}</p>
          <a href={answer.href}>{answer.action} <b>↗</b></a>
        </div>
        <div className="askFoot">For support or legal requests: <a href="mailto:stackpilotfe@outlook.com">stackpilotfe@outlook.com</a></div>
      </div>

      <button
        type="button"
        className="askOrb"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close Ask FlytheBG" : "Ask FlytheBG"}
      >
        <span className="askOrbMark"><img src="/brand/flythebg-mark.svg" alt="" width="28" height="28" /></span>
        <span className="askOrbText"><b>Ask</b><small>FlytheBG</small></span>
        <i aria-hidden="true">↗</i>
      </button>
    </aside>
  );
}
