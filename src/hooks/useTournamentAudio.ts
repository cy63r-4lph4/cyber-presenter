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

function log(...args: unknown[]) {
  console.log("[tournament-audio]", ...args);
}

function describe(label: string, audio: HTMLAudioElement) {
  return `${label}: paused=${audio.paused} muted=${audio.muted} volume=${audio.volume.toFixed(2)} readyState=${audio.readyState} networkState=${audio.networkState} error=${audio.error ? audio.error.code : "none"}`;
}

// Idempotent — call this any time you want an element audible. Logs loudly
// if play() keeps failing so a paused-but-faded-up element is never silent
// without you knowing why.
function ensurePlaying(audio: HTMLAudioElement, label: string) {
  if (!audio.paused) return;
  if (audio.error) {
    log(`${label} has an error, cannot play`, audio.error);
    return;
  }
  audio
    .play()
    .then(() =>
      log(`${label} ensurePlaying() succeeded`, describe(label, audio)),
    )
    .catch((err) =>
      log(`${label} ensurePlaying() FAILED`, err, describe(label, audio)),
    );
}

const activeFades = new WeakMap<HTMLAudioElement, () => void>();

function fade(audio: HTMLAudioElement, to: number, ms: number, label: string) {
  activeFades.get(audio)?.();

  // If we're fading UP, make sure the element is actually playing —
  // this is the fix: volume alone is meaningless on a paused element.
  if (to > 0) ensurePlaying(audio, label);

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
      activeFades.delete(audio);
      log(`fade complete → ${label} = ${to}`, describe(label, audio));
    }
  }, stepTime);

  const cancel = () => clearInterval(id);
  activeFades.set(audio, cancel);
  return cancel;
}

export function useTournamentAudio(phase: TournamentState["phase"]) {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const focusRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

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

    // Loudly report every unexpected pause so we can see WHY it stops,
    // instead of finding out three log lines later via a stale volume fade.
    const onPause = (label: string) => () =>
      log(`${label} PAUSED unexpectedly`, new Error().stack);
    ambient.addEventListener("pause", onPause("ambient"));
    focus.addEventListener("pause", onPause("focus"));

    const onError = (label: string) => (e: Event) =>
      log(`${label} <audio> error event`, (e.target as HTMLAudioElement).error);
    ambient.addEventListener("error", onError("ambient"));
    focus.addEventListener("error", onError("focus"));

    ambient
      .play()
      .then(() => log("ambient autoplay OK", describe("ambient", ambient)))
      .catch((err) =>
        log("ambient autoplay FAILED", err, describe("ambient", ambient)),
      );

    focus
      .play()
      .then(() => log("focus autoplay OK", describe("focus", focus)))
      .catch((err) =>
        log("focus autoplay FAILED", err, describe("focus", focus)),
      );

    return () => {
      ambient.pause();
      focus.pause();
    };
  }, []);

  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      setUnlocked(true);
      [ambientRef.current, focusRef.current].forEach((a, idx) => {
        if (!a) return;
        const label = idx === 0 ? "ambient" : "focus";
        a.muted = false;
        ensurePlaying(a, label);
      });
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

  useEffect(() => {
    const ambient = ambientRef.current;
    const focus = focusRef.current;
    if (!ambient || !focus) return;

    const active = phase !== "idle";
    const showFocus = FOCUS_PHASES.has(phase);
    log(`phase → ${phase}`, { active, showFocus });

    if (!active) {
      fade(ambient, 0, FADE_MS, "ambient");
      fade(focus, 0, FADE_MS, "focus");
      return;
    }

    if (showFocus) {
      fade(focus, FOCUS_VOLUME, FADE_MS, "focus");
      fade(ambient, 0, FADE_MS, "ambient");
    } else {
      fade(ambient, AMBIENT_VOLUME, FADE_MS, "ambient");
      fade(focus, 0, FADE_MS, "focus");
    }
  }, [phase]);

  return { unlocked };
}
