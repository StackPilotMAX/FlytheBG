"use client";

import { useEffect, useRef } from "react";

export function PassportDragEnhancer() {
  const drag = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".interactiveSheet canvas");
    if (!canvas) return;

    const setRange = (input: HTMLInputElement, value: number) => {
      const min = Number(input.min || -1);
      const max = Number(input.max || 1);
      const next = Math.min(max, Math.max(min, value));
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, String(next));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const getSelectedSliders = () => {
      const panel = document.querySelector<HTMLElement>(".selectedFrameManual");
      if (!panel) return null;
      const inputs = Array.from(panel.querySelectorAll<HTMLInputElement>("input[type=range]"));
      return inputs.length >= 2 ? { x: inputs[0], y: inputs[1] } : null;
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType !== "touch") return;
      drag.current = { x: event.clientX, y: event.clientY, active: true };
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!drag.current.active) return;
      const sliders = getSelectedSliders();
      if (!sliders) return;
      const dx = (event.clientX - drag.current.x) / Math.max(1, canvas.clientWidth) * 3;
      const dy = (event.clientY - drag.current.y) / Math.max(1, canvas.clientHeight) * 3;
      if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return;
      setRange(sliders.x, Number(sliders.x.value) + dx);
      setRange(sliders.y, Number(sliders.y.value) + dy);
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
      event.preventDefault();
    };

    const onUp = (event: PointerEvent) => {
      drag.current.active = false;
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener("pointerdown", onDown, { passive: false });
    canvas.addEventListener("pointermove", onMove, { passive: false });
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  });

  return <span className="srOnly" aria-live="polite">Selected passport copies can be dragged to move their crop.</span>;
}
