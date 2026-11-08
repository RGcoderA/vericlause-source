"use client";

import { useCallback, useState } from "react";

export function useClauseHighlight() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const highlight = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    const started = performance.now();
    const scroll = () => {
      const node = document.getElementById(sectionId);
      if (node) {
        const viewport = node.closest("[data-slot='scroll-area-viewport']");
        if (viewport instanceof HTMLElement) {
          const nodeRect = node.getBoundingClientRect();
          const viewRect = viewport.getBoundingClientRect();
          const top = viewport.scrollTop + (nodeRect.top - viewRect.top) - viewRect.height / 2 + nodeRect.height / 2;
          viewport.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        } else {
          node.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      if (performance.now() - started < 500) window.requestAnimationFrame(scroll);
    };
    window.requestAnimationFrame(scroll);
  }, []);

  return { activeSectionId, highlight, setActiveSectionId };
}
