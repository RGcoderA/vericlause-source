"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chunkText } from "@/lib/speech/chunks";
import { VOICE_CHUNK } from "@/lib/speech/grok";

export type SpeechSource = "document" | "simple";
export type SpeechStatus = "idle" | "preparing" | "playing" | "paused";

type Clip = { ok: true; url: string } | { ok: false; message: string };

async function requestClip(text: string, language: string, signal: AbortSignal): Promise<Clip> {
  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
    signal,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, message: body?.error || "Reading did not start. Try again." };
  }
  const blob = await response.blob();
  return { ok: true, url: URL.createObjectURL(blob) };
}

export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [active, setActive] = useState<SpeechSource | null>(null);
  const [failed, setFailed] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const generation = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedRef = useRef(false);
  const urlsRef = useRef<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const release = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  const stop = useCallback(() => {
    generation.current += 1;
    pausedRef.current = false;
    release();
    setFailed(false);
    setFailure(null);
    setStatus("idle");
    setActive(null);
  }, [release]);

  const playClip = useCallback((audio: HTMLAudioElement, url: string, token: number) => {
    return new Promise<"ended" | "stopped">((resolve) => {
      let settled = false;
      const settle = (value: "ended" | "stopped") => {
        if (settled) return;
        settled = true;
        audio.removeEventListener("ended", onEnd);
        window.clearInterval(timer);
        resolve(value);
      };
      const onEnd = () => settle("ended");
      audio.addEventListener("ended", onEnd);
      const timer = window.setInterval(() => {
        if (generation.current !== token) settle("stopped");
      }, 150);
      audio.src = url;
      void audio.play().catch(() => {
        setFailed(true);
        setFailure("Reading did not start. Try again.");
        settle("stopped");
      });
    });
  }, []);

  const play = useCallback((source: SpeechSource, text: string, lang: string) => {
    const chunks = chunkText(text, VOICE_CHUNK);
    if (chunks.length === 0) {
      setFailed(true);
      setFailure("There is nothing to read.");
      return;
    }
    const token = generation.current + 1;
    generation.current = token;
    pausedRef.current = false;
    release();
    setFailed(false);
    setFailure(null);
    setActive(source);
    setStatus("preparing");

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    void (async () => {
      try {
        const follow = (piece: string) =>
          requestClip(piece, lang, signal).catch((error: unknown) => {
            if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
              return { ok: false as const, message: "" };
            }
            return { ok: false as const, message: "Reading did not start. Try again." };
          });
        let pending = follow(chunks[0] ?? "");
        for (let index = 0; index < chunks.length; index += 1) {
          if (generation.current !== token) return;
          const clip = await pending;
          const next = chunks[index + 1];
          if (next) pending = follow(next);
          if (generation.current !== token || signal.aborted) return;
          if (clip.ok === false) {
            controller.abort();
            if (!clip.message) return;
            setFailed(true);
            setFailure(clip.message);
            setStatus("idle");
            setActive(null);
            return;
          }
          urlsRef.current.push(clip.url);
          while (pausedRef.current && generation.current === token) {
            await new Promise((resolve) => window.setTimeout(resolve, 80));
          }
          if (generation.current !== token) return;
          setStatus("playing");
          const outcome = await playClip(audio, clip.url, token);
          URL.revokeObjectURL(clip.url);
          if (outcome === "stopped" || generation.current !== token) return;
        }
        if (generation.current !== token) return;
        setStatus("idle");
        setActive(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (generation.current !== token) return;
        setFailed(true);
        setFailure("Reading did not start. Try again.");
        setStatus("idle");
        setActive(null);
      }
    })();
  }, [playClip, release]);

  const pause = useCallback(() => {
    if (generation.current === 0) return;
    pausedRef.current = true;
    audioRef.current?.pause();
    setStatus((current) => (current === "idle" ? current : "paused"));
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    const audio = audioRef.current;
    if (audio && audio.src && !audio.src.startsWith("data:") && audio.paused && !audio.ended) {
      setStatus("playing");
      void audio.play().catch(() => undefined);
      return;
    }
    setStatus("preparing");
  }, []);

  useEffect(() => () => {
    generation.current += 1;
    release();
  }, [release]);

  return { status, active, supported: true, failed, failure, play, pause, resume, stop };
}