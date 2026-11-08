"use client";

import { useCallback, useEffect, useState } from "react";
import type { Playbook, Rule } from "@/types/playbook";

export function usePlaybook() {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/playbook");
      const body = (await response.json()) as { playbook?: Playbook; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not load playbook.");
      setPlaybook(body.playbook || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load playbook.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveRules = useCallback(async (rules: Rule[]) => {
    setSaving(true);
    try {
      const response = await fetch("/api/playbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const body = (await response.json()) as { playbook?: Playbook; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save playbook.");
      setPlaybook(body.playbook || null);
    } finally {
      setSaving(false);
    }
  }, []);

  const compile = useCallback(async (text: string) => {
    const response = await fetch("/api/playbook/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, add: true }),
    });
    const body = (await response.json()) as {
      playbook?: Playbook;
      rule?: Rule;
      error?: string;
    };
    if (!response.ok) throw new Error(body.error || "Could not compile that rule.");
    if (body.playbook) setPlaybook(body.playbook);
    return body.rule;
  }, []);

  const reset = useCallback(async () => {
    const response = await fetch("/api/playbook", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules: [], reset: true }),
    });
    const body = (await response.json()) as { playbook?: Playbook; error?: string };
    if (!response.ok) throw new Error(body.error || "Could not reset playbook.");
    setPlaybook(body.playbook || null);
  }, []);

  return { playbook, loading, saving, error, refresh, saveRules, compile, reset, setPlaybook };
}
