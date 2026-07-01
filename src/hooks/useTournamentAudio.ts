// client/src/hooks/useTournamentAudio.ts
import { useEffect, useRef, useState } from "react";
import type { TournamentState } from "../shared/types/Tournament";

const AMBIENT_SRC = "/audio/tournament.mp3";
const FOCUS_SRC = "/audio/tournament/focus.mp3";

const FOCUS_PHASES = new Set<TournamentState["phase"]>([
  "match-active",
  "question-result",
]);

const AMBIENT_VOLUME = 0.35;
const FOCUS_VOLUME = 0.5;
const FADE_MS = 1200;

function fade(audio: HTMLAudioElement, to: number, ms: number) {
  const from = audio.volume;
  const steps = 24;
  const stepTime = ms / steps;
  let i = 0;
  const id = setInterval(() => {
    i++;
    audio.volume = from + (to - from) * (i / steps);
    if (i >= steps) {
      clearInterval(id);
      audio.volume = to;
    }
  }, stepTime);
  return () => clearInterval(id);
}

export function useTournamentAudio(phase: TournamentState["phase"]) {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const focusRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  // Create + immediately play both tracks MUTED. Muted autoplay is always
  // allowed, so this never triggers a browser block — no gesture, no UI.
  useEffect(() => {
    const ambient = new Audio(AMBIENT_SRC);
    ambient.loop = true;
    ambient.muted = true;
    ambient.volume = 0;

    const focus = new Audio(FOCUS_SRC);
    focus.loop = true;
    focus.muted = true;
    focus.volume = 0;

    ambientRef.current = ambient;
    focusRef.current = focus;

    ambient.play().catch(() => {});
    focus.play().catch(() => {});

    return () => {
      ambient.pause();
      focus.pause();
    };
  }, []);

  // Passive, invisible unlock — fires on literally any interaction with
  // this document: a stray click while setting up the laptop, a physical
  // clicker's keypress, anything. No UI, no prompt.
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      setUnlocked(true);
      const ambient = ambientRef.current;
      const focus = focusRef.current;
      if (ambient) ambient.muted = false;
      if (focus) focus.muted = false;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  // React to phase changes — same crossfade logic as before, just gated
  // on `unlocked` for actually being audible (volume stays 0 until then,
  // but that's fine, nothing to hear yet anyway).
  useEffect(() => {
    const ambient = ambientRef.current;
    const focus = focusRef.current;
    if (!ambient || !focus) return;

    const active = phase !== "idle";
    const showFocus = FOCUS_PHASES.has(phase);

    if (!active) {
      fade(ambient, 0, FADE_MS);
      fade(focus, 0, FADE_MS);
      return;
    }

    if (showFocus) {
      fade(focus, FOCUS_VOLUME, FADE_MS);
      fade(ambient, 0, FADE_MS);
    } else {
      fade(ambient, AMBIENT_VOLUME, FADE_MS);
      fade(focus, 0, FADE_MS);
    }
  }, [phase]);

  return { unlocked };
}
