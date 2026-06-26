import type { ComponentType } from "react";

export type PresentationState = {
  currentSlide: number;
  revealStep: number;
  /**
   * Generic per-scene step counter, separate from revealStep.
   *
   * revealStep is driven by the single global "Reveal" button on Remote and
   * is meant for simple slides that just want to step through a talking-
   * points list (see RevealPanel).
   *
   * sceneStep exists for scenes with their OWN internal flow (e.g. a fake
   * login demo: email -> fake page -> captured -> lesson). Those scenes
   * render bespoke Remote buttons (via SceneEntry.controls) with their own
   * labels, but the buttons just increment/set this same shared number —
   * we don't want a new server field per scene as more scenes get added.
   * The scene component itself decides what each value of sceneStep means.
   */
  sceneStep: number;
  mode: "presenting" | "demo" | "quiz" | "blackout" | "lobby";
};

export type LiveQuestion = {
  id: string;
  prompt: string;
  type: "short-text";
  isOpen: boolean;
};

export type AudienceAnswer = {
  id: string;
  questionId: string;
  participantId: string;
  participantName: string;
  answer: string;
  category?: "strong" | "risky" | "discussion";
  visible: boolean;
  createdAt: number;
};

export type AudienceQuestion = {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  status: "pending" | "answered" | "deferred";
  pinned: boolean;
  slideIndex: number;
  createdAt: number;
};

/** A trainer-authored multiple-choice quiz. Mirrors LiveQuestion's lifecycle:
 *  activate -> (votes come in) -> close -> reveal. */
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  isOpen: boolean;
  revealed: boolean;
};

export type QuizVote = {
  id: string;
  quizId: string;
  participantId: string;
  participantName: string;
  optionIndex: number;
  createdAt: number;
};

/**
 * Props every scene component receives on the Display side.
 *
 * Cross-cutting concerns (audience wall, pinned question banner, quiz
 * overlay) are NOT part of this — they render as overlays in Display.tsx,
 * above whatever scene is active, because they aren't tied to any single
 * scene.
 */
export type SceneProps = {
  slideIndex: number;
  revealStep: number;
  sceneStep: number;
  mode: PresentationState["mode"];
  question: LiveQuestion | null;
};

/**
 * Props a scene's bespoke Remote controls component receives. Deliberately
 * minimal — the scene component interprets sceneStep however it wants;
 * Remote's job is just to render buttons and call setSceneStep.
 */
export type SceneControlsProps = {
  sceneStep: number;
  setSceneStep: (step: number) => void;
};

/**
 * A registry entry. Scenes are now components first — title/subtitle text
 * is no longer assumed to exist, since bespoke scenes render their own
 * content entirely. navLabel is the one piece of text every scene must
 * provide, and it exists ONLY for Remote's slide list / "Up Next" preview —
 * it is never rendered on Display.
 */
export type SceneEntry = {
  navLabel: string;
  component: ComponentType<SceneProps>;
  /** Optional bespoke Remote panel, rendered instead of generic controls
   *  when this scene is active. Omit for scenes that don't need their own
   *  step flow (most simple slides won't). */
  controls?: ComponentType<SceneControlsProps>;
};

export type VideoCommand = "play" | "pause" | "restart";

export type SceneVideoEvent = {
  scene: string;
  command: VideoCommand;
};

export type PhishCapture = {
  id: string;
  emailTyped: string;
  passwordEntered: boolean;
  capturedAt: number;
};