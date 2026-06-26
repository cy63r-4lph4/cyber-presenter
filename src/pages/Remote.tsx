import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Eye,
  HelpCircle,
  Maximize2,
  MessageSquareText,
  Minimize2,
  MonitorUp,
  Pin,
  PinOff,
  Plus,
  QrCode,
  RotateCcw,
  Send,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { socket } from "../socket";
import { scenes, getScene } from "../scenes/sceneRegistry";
import type { QuizQuestion, QuizVote } from "../shared/types/presentation";
import {
  TOURNAMENT_INITIAL_STATE,
  type TournamentState,
} from "../shared/types/Tournament";
import { TournamentControls } from "../scenes/quiz/TournamentControls";
import {
  QUIZ_BANK,
  QUIZ_CATEGORIES,
  type QuizCategory,
} from "../data/quizBank";

type PresentationState = {
  currentSlide: number;
  revealStep: number;
  sceneStep: number;
  mode: "presenting" | "demo" | "quiz" | "blackout" | "lobby";
};

type LiveQuestion = {
  id: string;
  prompt: string;
  type: "short-text";
  isOpen: boolean;
};

type AudienceAnswer = {
  id: string;
  questionId: string;
  participantId: string;
  participantName: string;
  answer: string;
  category?: "strong" | "risky" | "discussion";
  visible: boolean;
  createdAt: number;
};

type AudienceQuestion = {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  status: "pending" | "answered" | "deferred";
  pinned: boolean;
  slideIndex: number;
  createdAt: number;
};

type RemotePanel = "slides" | "audience" | "questions" | "quiz" | "tournament";
function vibrate() {
  if ("vibrate" in navigator) navigator.vibrate(14);
}

function send(command: string) {
  socket.emit("remote:command", command);
  vibrate();
}

const questionTemplates = [
  "What red flags would make you suspect this is a phishing attempt?",
  "What would you do before clicking a link in a suspicious email?",
  "Why is password reuse dangerous?",
  "What should you do if someone asks for urgent payment by email?",
];

const statusColors = {
  pending: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  answered: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  deferred: "bg-slate-400/10 text-slate-400 border-slate-400/20",
};

const optionLetters = ["A", "B", "C", "D"];
const emptyDraftOptions = ["", ""];

export function Remote() {
  const [state, setState] = useState<PresentationState>({
    currentSlide: 0,
    revealStep: 0,
    sceneStep: 0,
    mode: "presenting",
  });

  const [connected, setConnected] = useState(socket.connected);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<RemotePanel>("slides");

  const [question, setQuestion] = useState<LiveQuestion | null>(null);
  const [answers, setAnswers] = useState<AudienceAnswer[]>([]);
  const [audienceQuestions, setAudienceQuestions] = useState<
    AudienceQuestion[]
  >([]);
  const [draftQuestion, setDraftQuestion] = useState(questionTemplates[0]);

  const [prevQCount, setPrevQCount] = useState(0);
  const [newQBadge, setNewQBadge] = useState(false);
  const [quizCategoryFilter, setQuizCategoryFilter] = useState<
    QuizCategory | "all"
  >("all");
  const [showQuizBank, setShowQuizBank] = useState(false);

  // Quiz authoring + live state
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [quizVotes, setQuizVotes] = useState<QuizVote[]>([]);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftOptions, setDraftOptions] = useState<string[]>(emptyDraftOptions);
  const [draftCorrectIndex, setDraftCorrectIndex] = useState(0);
  const [tournamentState, setTournamentState] = useState<TournamentState>(
    TOURNAMENT_INITIAL_STATE,
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("state:update", setState);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("question:update", setQuestion);
    socket.on("answers:update", setAnswers);
    socket.on("audience-questions:update", (qs: AudienceQuestion[]) => {
      setAudienceQuestions(qs);
    });
    socket.on("quiz:update", setQuiz);
    socket.on("quiz-votes:update", setQuizVotes);
    socket.on("tournament:state", setTournamentState);

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.off("state:update", setState);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("question:update", setQuestion);
      socket.off("answers:update", setAnswers);
      socket.off("audience-questions:update");
      socket.off("quiz:update", setQuiz);
      socket.off("quiz-votes:update", setQuizVotes);
      socket.off("tournament:state", setTournamentState);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Badge when new audience questions arrive while not on the questions panel
  useEffect(() => {
    const pending = audienceQuestions.filter(
      (q) => q.status === "pending",
    ).length;
    if (pending > prevQCount && activePanel !== "questions") {
      setNewQBadge(true);
      if ("vibrate" in navigator) navigator.vibrate([30, 60, 30]);
    }
    setPrevQCount(pending);
  }, [audienceQuestions]);

  const slideIndex = Math.min(state.currentSlide, scenes.length - 1);
  const current = getScene(slideIndex);
  const next = scenes[slideIndex + 1];

  const progress = useMemo(() => {
    return ((slideIndex + 1) / scenes.length) * 100;
  }, [slideIndex]);

  const visibleAnswers = answers.filter((answer) => answer.visible).length;
  const pendingQuestions = audienceQuestions.filter(
    (q) => q.status === "pending",
  ).length;
  const pinnedQuestion = audienceQuestions.find((q) => q.pinned) ?? null;

  const quizVoteCounts = useMemo(() => {
    if (!quiz) return [];
    return quiz.options.map(
      (_, index) =>
        quizVotes.filter((vote) => vote.optionIndex === index).length,
    );
  }, [quiz, quizVotes]);

  const quizTotalVotes = quizVotes.length;

  async function toggleRemoteFullscreen() {
    vibrate();

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // iOS Safari may ignore fullscreen for normal browser tabs.
    }
  }

  function handleJumpToSlide(index: number) {
    send(`goto:${index}`);
    setIsDropdownOpen(false);
  }

  /** Called by a scene's bespoke controls component (e.g. FakeLoginControls)
   *  to set sceneStep directly — separate from the global revealStep flow. */
  function setSceneStep(step: number) {
    socket.emit("scene:step", step);
    vibrate();
  }

  function activateQuestion() {
    const prompt = draftQuestion.trim();

    if (!prompt) return;

    socket.emit("question:activate", {
      id: "",
      type: "short-text",
      prompt,
      isOpen: true,
    });

    setActivePanel("audience");
    vibrate();
  }

  function closeQuestion() {
    socket.emit("question:close");
    vibrate();
  }

  function clearAnswers() {
    socket.emit("answers:clear");
    vibrate();
  }

  function updateAnswer(
    answerId: string,
    payload: {
      visible?: boolean;
      category?: "strong" | "risky" | "discussion";
    },
  ) {
    socket.emit("answer:update", {
      answerId,
      ...payload,
    });

    vibrate();
  }

  function updateAudienceQuestion(
    questionId: string,
    payload: {
      status?: "pending" | "answered" | "deferred";
      pinned?: boolean;
    },
  ) {
    socket.emit("audience-question:update", { questionId, ...payload });
    vibrate();
  }

  function clearAudienceQuestions() {
    socket.emit("audience-questions:clear");
    vibrate();
  }

  // ── Quiz authoring ────────────────────────────────────────────────────

  function updateDraftOption(index: number, value: string) {
    setDraftOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addDraftOption() {
    if (draftOptions.length >= 4) return;
    setDraftOptions((prev) => [...prev, ""]);
    vibrate();
  }

  function removeDraftOption(index: number) {
    if (draftOptions.length <= 2) return;
    setDraftOptions((prev) => prev.filter((_, i) => i !== index));
    if (draftCorrectIndex >= index && draftCorrectIndex > 0) {
      setDraftCorrectIndex((prev) => prev - 1);
    }
    vibrate();
  }

  const canLaunchQuiz =
    draftPrompt.trim().length > 0 &&
    draftOptions.filter((o) => o.trim().length > 0).length >= 2;

  function launchQuiz() {
    const options = draftOptions
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    if (!draftPrompt.trim() || options.length < 2) return;

    socket.emit("quiz:activate", {
      prompt: draftPrompt.trim(),
      options,
      correctIndex: Math.min(draftCorrectIndex, options.length - 1),
    });

    vibrate();
  }

  function closeQuizVoting() {
    socket.emit("quiz:close");
    vibrate();
  }

  function revealQuizAnswer() {
    socket.emit("quiz:reveal");
    vibrate();
  }

  function clearQuiz() {
    socket.emit("quiz:clear");
    setDraftPrompt("");
    setDraftOptions(emptyDraftOptions);
    setDraftCorrectIndex(0);
    vibrate();
  }

  return (
    <main className="min-h-screen bg-[#07080b] font-sans text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <section className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-6 pt-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-inner ring-1 ring-white/5">
              <Sparkles size={14} className="text-cyan-400" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Studio Remote
              </p>
              <h1 className="text-sm font-medium capitalize tracking-tight text-slate-300">
                {state.mode} mode
              </h1>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              connected
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "animate-pulse border-red-500/20 bg-red-500/5 text-red-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-red-400"
              }`}
            />
            {connected ? "Live" : "Offline"}
          </div>
        </header>

        {/* Pinned audience question callout */}
        {pinnedQuestion && (
          <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/[0.06] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Pin size={13} className="mt-0.5 shrink-0 text-purple-300" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                    Pinned question · {pinnedQuestion.participantName}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    {pinnedQuestion.text}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  updateAudienceQuestion(pinnedQuestion.id, { pinned: false })
                }
                className="shrink-0 rounded-lg bg-white/[0.06] p-1.5 text-slate-400 active:scale-95"
              >
                <PinOff size={12} />
              </button>
            </div>
          </div>
        )}

        <section className="relative mt-4 rounded-[30px] border border-white/[0.06] bg-gradient-to-b from-[#0e1118] to-[#0a0d14] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400/80">
                Current Slide
              </span>
              <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-white">
                {current.navLabel || "Untitled Scene"}
              </h2>
            </div>

            <div ref={dropdownRef} className="relative shrink-0">
              <button
                onClick={() => {
                  vibrate();
                  setIsDropdownOpen((value) => !value);
                }}
                className={`flex h-14 w-16 flex-col items-center justify-center rounded-2xl border outline-none transition ${
                  isDropdownOpen
                    ? "border-cyan-500/50 bg-slate-900 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                    : "border-white/[0.06] bg-slate-950/60 shadow-inner"
                }`}
              >
                <span className="-mb-0.5 text-lg font-bold tracking-tight text-white">
                  {slideIndex + 1}
                </span>
                <span className="flex items-center gap-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-500">
                  of {scenes.length}
                  <ChevronDown
                    size={8}
                    className={`transition-transform ${
                      isDropdownOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="mb-1 border-b border-white/[0.04] px-2.5 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Jump to Screen
                    </p>
                  </div>

                  <div className="max-h-60 space-y-0.5 overflow-y-auto pr-0.5">
                    {scenes.map((entry, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpToSlide(idx)}
                        className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left transition ${
                          idx === slideIndex
                            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <p className="truncate pr-2 text-xs font-medium">
                          {entry.navLabel}
                        </p>

                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ${
                            idx === slideIndex
                              ? "bg-cyan-500/20 font-bold text-cyan-300"
                              : "bg-slate-950 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scenes no longer carry a subtitle for preview — navLabel above
              is the only guaranteed text. Bespoke scenes render their own
              content entirely on Display. */}

          <div className="relative mt-5">
            <div className="h-1 w-full rounded-full bg-slate-950 shadow-inner">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-cyan-400 bg-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Up Next
          </span>
          <p className="max-w-[70%] truncate text-xs font-medium text-slate-400">
            {next ? next.navLabel : "End of presentation"}
          </p>
        </section>

        {/* Four-tab panel */}
        <section className="mt-4 grid grid-cols-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1">
          <button
            onClick={() => setActivePanel("slides")}
            className={`rounded-xl py-2 text-[11px] font-bold transition ${
              activePanel === "slides"
                ? "bg-white text-slate-950"
                : "text-slate-500"
            }`}
          >
            Slides
          </button>

          <button
            onClick={() => setActivePanel("audience")}
            className={`rounded-xl py-2 text-[11px] font-bold transition ${
              activePanel === "audience"
                ? "bg-white text-slate-950"
                : "text-slate-500"
            }`}
          >
            Poll
          </button>

          <button
            onClick={() => {
              setActivePanel("questions");
              setNewQBadge(false);
            }}
            className={`relative rounded-xl py-2 text-[11px] font-bold transition ${
              activePanel === "questions"
                ? "bg-white text-slate-950"
                : "text-slate-500"
            }`}
          >
            Asks
            {(newQBadge || pendingQuestions > 0) &&
              activePanel !== "questions" && (
                <span className="absolute right-1.5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-400 text-[9px] font-black text-slate-950">
                  {pendingQuestions}
                </span>
              )}
          </button>

          <button
            onClick={() => setActivePanel("quiz")}
            className={`relative rounded-xl py-2 text-[11px] font-bold transition ${
              activePanel === "quiz"
                ? "bg-white text-slate-950"
                : "text-slate-500"
            }`}
          >
            Quiz
            {quiz && activePanel !== "quiz" && (
              <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-violet-400" />
            )}
          </button>

          <button
            onClick={() => setActivePanel("tournament")}
            className={`relative rounded-xl py-2 text-[11px] font-bold transition ${
              activePanel === "tournament"
                ? "bg-white text-slate-950"
                : "text-slate-500"
            }`}
          >
            Arena
            {tournamentState.phase !== "idle" &&
              activePanel !== "tournament" && (
                <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-amber-400" />
              )}
          </button>
        </section>

        {/* ── Slide Control ──────────────────────────────────────────────────── */}
        {activePanel === "slides" && (
          <section className="mt-5 flex flex-col space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => send("prev")}
                className="group flex flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-gradient-to-b from-slate-900/50 to-slate-950/50 py-6 text-slate-400 shadow-md transition active:scale-95"
              >
                <ArrowLeft
                  size={20}
                  className="transition-transform group-active:-translate-x-1"
                />
                <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Back
                </span>
              </button>

              <button
                onClick={() => send("next")}
                className="group col-span-3 overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-200 p-6 text-slate-950 shadow-[0_12px_24px_-6px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] transition active:scale-[0.98]"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600/80">
                      Advance
                    </p>
                    <p className="text-lg font-bold tracking-tight">
                      Next Slide
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition-transform group-active:translate-x-1">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {current.controls ? (
                // Bespoke scene controls (e.g. FakeLoginControls) replace
                // the generic Reveal button for this scene only. Blackout
                // and Lobby stay available regardless — they're global
                // stage controls, not tied to scene content.
                <div className="col-span-2 rounded-[24px] border border-amber-400/20 bg-amber-400/[0.04] p-3">
                  {(() => {
                    const Controls = current.controls;
                    return (
                      <Controls
                        sceneStep={state.sceneStep}
                        setSceneStep={setSceneStep}
                      />
                    );
                  })()}
                </div>
              ) : (
                <button
                  onClick={() => send("reveal")}
                  className="group flex flex-col items-center justify-center rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-[#11141c] to-[#0b0d14] p-4 shadow-lg transition active:scale-95"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                    <Eye size={18} />
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-slate-300">
                    Reveal Step
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                    Index: {state.revealStep}
                  </p>
                </button>
              )}

              <button
                onClick={() => send("blackout")}
                className="group flex flex-col items-center justify-center rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-[#11141c] to-[#0b0d14] p-4 shadow-lg transition active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 ring-1 ring-white/10">
                  <CircleDot size={18} />
                </div>
                <p className="mt-2.5 text-xs font-semibold text-slate-300">
                  Stage Screen
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                  Toggle Blackout
                </p>
              </button>
            </div>

            <button
              onClick={() => send("lobby")}
              className={`group flex w-full items-center justify-center gap-3 rounded-[24px] border p-4 shadow-lg transition active:scale-95 ${
                state.mode === "lobby"
                  ? "border-cyan-500/40 bg-cyan-950/30"
                  : "border-white/[0.06] bg-gradient-to-b from-[#11141c] to-[#0b0d14]"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${
                  state.mode === "lobby"
                    ? "bg-cyan-500/15 text-cyan-300 ring-cyan-500/30"
                    : "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20"
                }`}
              >
                <QrCode size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-300">
                  {state.mode === "lobby"
                    ? "Showing Lobby"
                    : "Show Lobby Screen"}
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  QR join screen for the room
                </p>
              </div>
            </button>
          </section>
        )}

        {/* ── Poll / Audience Answers ────────────────────────────────────────── */}
        {activePanel === "audience" && (
          <section className="mt-5 rounded-[28px] border border-white/[0.06] bg-gradient-to-b from-[#0e1118] to-[#090b10] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
                  <Users size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Audience Room
                  </p>
                  <p className="text-xs font-semibold text-slate-300">
                    {answers.length} answers · {visibleAnswers} shown
                  </p>
                </div>
              </div>

              <button
                onClick={closeQuestion}
                className="rounded-xl bg-white/[0.06] px-3 py-2 text-[10px] font-bold text-slate-300 active:scale-95"
              >
                Close
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.05] bg-black/20 p-3">
              <div className="flex items-start gap-2">
                <MessageSquareText
                  size={15}
                  className="mt-0.5 shrink-0 text-cyan-300"
                />
                <p className="text-xs leading-5 text-slate-300">
                  {question
                    ? question.prompt
                    : "No active audience question yet."}
                </p>
              </div>

              {question && (
                <p
                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                    question.isOpen
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-red-400/10 text-red-300"
                  }`}
                >
                  {question.isOpen ? "Open for responses" : "Closed"}
                </p>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <textarea
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/[0.06] bg-black/25 p-3 text-xs leading-5 text-slate-200 outline-none focus:border-cyan-400/40"
                placeholder="Type the question you want audience to answer..."
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {questionTemplates.map((template) => (
                  <button
                    key={template}
                    onClick={() => setDraftQuestion(template)}
                    className="shrink-0 rounded-xl bg-white/[0.05] px-3 py-2 text-[10px] font-semibold text-slate-400 active:scale-95"
                  >
                    Template
                  </button>
                ))}
              </div>

              <button
                onClick={activateQuestion}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98]"
              >
                <Send size={14} />
                Ask Audience
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Moderation Queue
              </p>

              <button
                onClick={clearAnswers}
                className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-300 active:scale-95"
              >
                <Trash2 size={11} />
                Clear
              </button>
            </div>

            <div className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {answers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Waiting for audience answers.
                  </p>
                </div>
              )}

              {answers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/[0.06] bg-black/25 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-cyan-300">
                        {item.participantName}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        {item.answer}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        updateAnswer(item.id, { visible: !item.visible })
                      }
                      className={`shrink-0 rounded-xl px-2.5 py-1.5 text-[10px] font-black active:scale-95 ${
                        item.visible
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {item.visible ? (
                        <span className="inline-flex items-center gap-1">
                          <Check size={11} /> Shown
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <X size={11} /> Hidden
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["strong", "discussion", "risky"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateAnswer(item.id, { category: cat })}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold capitalize active:scale-95 ${
                          item.category === cat
                            ? "bg-cyan-300 text-slate-950"
                            : "bg-white/[0.05] text-slate-500"
                        }`}
                      >
                        <Tag size={10} />
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Audience Questions ─────────────────────────────────────────────── */}
        {activePanel === "questions" && (
          <section className="mt-5 rounded-[28px] border border-white/[0.06] bg-gradient-to-b from-[#0e1118] to-[#090b10] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/20">
                  <HelpCircle size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    From the Room
                  </p>
                  <p className="text-xs font-semibold text-slate-300">
                    {pendingQuestions} pending · {audienceQuestions.length}{" "}
                    total
                  </p>
                </div>
              </div>

              <button
                onClick={clearAudienceQuestions}
                className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-300 active:scale-95"
              >
                <Trash2 size={11} />
                Clear all
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {audienceQuestions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-6 text-center">
                  <HelpCircle
                    size={20}
                    className="mx-auto mb-2 text-slate-600"
                  />
                  <p className="text-xs text-slate-500">
                    No questions yet. Audience members can ask from the
                    /audience page.
                  </p>
                </div>
              )}

              {audienceQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-3 transition ${
                    q.pinned
                      ? "border-purple-400/30 bg-purple-400/[0.07]"
                      : "border-white/[0.06] bg-black/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold text-purple-300">
                          {q.participantName}
                        </p>
                        <span className="text-[9px] text-slate-600">
                          Slide {q.slideIndex + 1}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-200">
                        {q.text}
                      </p>
                    </div>

                    {/* Pin toggle */}
                    <button
                      onClick={() =>
                        updateAudienceQuestion(q.id, { pinned: !q.pinned })
                      }
                      className={`shrink-0 rounded-xl p-1.5 active:scale-95 ${
                        q.pinned
                          ? "bg-purple-400/20 text-purple-300"
                          : "bg-white/[0.06] text-slate-500"
                      }`}
                      title={q.pinned ? "Unpin" : "Pin to display"}
                    >
                      {q.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                    </button>
                  </div>

                  {/* Status row */}
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColors[q.status]}`}
                    >
                      {q.status}
                    </span>

                    <div className="ml-auto flex gap-1.5">
                      {(["pending", "answered", "deferred"] as const).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() =>
                              updateAudienceQuestion(q.id, { status: s })
                            }
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold capitalize transition active:scale-95 ${
                              q.status === s
                                ? "bg-white/10 text-white"
                                : "bg-white/[0.03] text-slate-500"
                            }`}
                          >
                            {s === "pending"
                              ? "↺"
                              : s === "answered"
                                ? "✓"
                                : "→"}{" "}
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Quiz ─────────────────────────────────────────────────────────────── */}
        {activePanel === "quiz" && (
          <section className="mt-5 rounded-[28px] border border-violet-400/[0.12] bg-gradient-to-b from-[#15101e] to-[#0c0913] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Live Quiz
                </p>
                <p className="text-xs font-semibold text-slate-300">
                  {quiz
                    ? quiz.revealed
                      ? "Answer revealed"
                      : quiz.isOpen
                        ? "Voting open"
                        : "Voting closed"
                    : "No quiz active"}
                </p>
              </div>
            </div>

            {/* No active quiz: authoring form */}
            {!quiz && (
              <div className="mt-4 space-y-3">
                {/* ── Quick-pick from bank ── */}
                <button
                  onClick={() => setShowQuizBank((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[10px] font-bold text-slate-400 active:scale-95"
                >
                  <span>
                    Pick from question bank ({QUIZ_BANK.length} questions)
                  </span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${showQuizBank ? "rotate-180" : ""}`}
                  />
                </button>

                {showQuizBank && (
                  <div className="space-y-2">
                    {/* Category filter pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setQuizCategoryFilter("all")}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition active:scale-95 ${quizCategoryFilter === "all" ? "border-slate-400/40 bg-slate-700 text-white" : "border-white/[0.06] text-slate-500"}`}
                      >
                        All
                      </button>
                      {QUIZ_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setQuizCategoryFilter(cat.id)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition active:scale-95 ${quizCategoryFilter === cat.id ? cat.color : "border-white/[0.06] text-slate-500"}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Question list */}
                    <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
                      {QUIZ_BANK.filter(
                        (q) =>
                          quizCategoryFilter === "all" ||
                          q.category === quizCategoryFilter,
                      ).map((q) => {
                        const cat = QUIZ_CATEGORIES.find(
                          (c) => c.id === q.category,
                        );
                        const diffColor =
                          q.difficulty === "easy"
                            ? "text-emerald-400"
                            : q.difficulty === "medium"
                              ? "text-amber-400"
                              : "text-rose-400";
                        return (
                          <button
                            key={q.id}
                            onClick={() => {
                              setDraftPrompt(q.prompt);
                              setDraftOptions([...q.options]);
                              setDraftCorrectIndex(q.correctIndex);
                              setShowQuizBank(false);
                              vibrate();
                            }}
                            className="w-full rounded-xl border border-white/[0.06] bg-black/20 p-2.5 text-left transition active:scale-[0.98] hover:border-violet-400/30"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider ${cat ? cat.color.split(" ")[0] : "text-slate-500"}`}
                              >
                                {cat?.label}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase ${diffColor}`}
                              >
                                · {q.difficulty}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-4 line-clamp-2">
                              {q.prompt}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <textarea
                  value={draftPrompt}
                  onChange={(event) => setDraftPrompt(event.target.value)}
                  rows={2}
                  placeholder="What's the quiz question?"
                  className="w-full resize-none rounded-2xl border border-white/[0.06] bg-black/25 p-3 text-xs leading-5 text-slate-200 outline-none focus:border-violet-400/40"
                />

                <div className="space-y-2">
                  {draftOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        onClick={() => setDraftCorrectIndex(index)}
                        title="Mark as correct answer"
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black transition active:scale-95 ${
                          draftCorrectIndex === index
                            ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/40"
                            : "bg-white/[0.06] text-slate-400"
                        }`}
                      >
                        {draftCorrectIndex === index ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          (optionLetters[index] ?? index + 1)
                        )}
                      </button>

                      <input
                        value={option}
                        onChange={(event) =>
                          updateDraftOption(index, event.target.value)
                        }
                        placeholder={`Option ${optionLetters[index] ?? index + 1}`}
                        className="flex-1 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-400/40"
                      />

                      {draftOptions.length > 2 && (
                        <button
                          onClick={() => removeDraftOption(index)}
                          className="shrink-0 rounded-xl bg-white/[0.04] p-2 text-slate-500 active:scale-95"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500">
                  Tap the letter badge to mark the correct answer.
                </p>

                {draftOptions.length < 4 && (
                  <button
                    onClick={addDraftOption}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.05] px-3 py-2 text-[10px] font-bold text-slate-400 active:scale-95"
                  >
                    <Plus size={12} />
                    Add option
                  </button>
                )}

                <button
                  onClick={launchQuiz}
                  disabled={!canLaunchQuiz}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98] disabled:opacity-30"
                >
                  <Send size={14} />
                  Launch Quiz
                </button>
              </div>
            )}

            {/* Active quiz: live results + controls */}
            {quiz && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-bold leading-snug text-white">
                  {quiz.prompt}
                </p>

                <div className="space-y-2">
                  {quiz.options.map((option, index) => {
                    const count = quizVoteCounts[index] ?? 0;
                    const pct =
                      quizTotalVotes > 0
                        ? Math.round((count / quizTotalVotes) * 100)
                        : 0;
                    const isCorrect = index === quiz.correctIndex;

                    return (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-xl border p-3 ${
                          quiz.revealed && isCorrect
                            ? "border-emerald-400/30 bg-emerald-400/[0.06]"
                            : "border-white/[0.06] bg-black/25"
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-violet-400/10"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                            <span className="grid h-5 w-5 place-items-center rounded-lg bg-white/10 text-[10px] font-black">
                              {optionLetters[index] ?? index + 1}
                            </span>
                            {option}
                            {quiz.revealed && isCorrect && (
                              <CheckCircle2
                                size={13}
                                className="text-emerald-300"
                              />
                            )}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {count} · {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {quizTotalVotes} total vote{quizTotalVotes !== 1 ? "s" : ""}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={closeQuizVoting}
                    disabled={!quiz.isOpen}
                    className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-[11px] font-bold text-slate-300 active:scale-95 disabled:opacity-30"
                  >
                    Close Voting
                  </button>
                  <button
                    onClick={revealQuizAnswer}
                    disabled={quiz.revealed}
                    className="rounded-xl bg-emerald-300 px-3 py-2.5 text-[11px] font-black text-slate-950 active:scale-95 disabled:opacity-30"
                  >
                    Reveal Answer
                  </button>
                </div>

                <button
                  onClick={clearQuiz}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2.5 text-[11px] font-bold text-red-300 active:scale-95"
                >
                  <Trash2 size={12} />
                  Clear Quiz
                </button>
              </div>
            )}
          </section>
        )}
        {activePanel === "tournament" && (
          <section className="mt-5 rounded-[28px] border border-amber-400/[0.12] bg-gradient-to-b from-[#1a1200] to-[#0d0900] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <TournamentControls />
          </section>
        )}
        <section className="mt-auto grid grid-cols-3 gap-3 pt-5">
          <button
            onClick={() => send("display-fullscreen")}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.02] py-3 text-slate-400 transition hover:bg-white/[0.04] hover:text-white active:scale-95"
          >
            <MonitorUp size={16} />
            <span className="mt-1.5 text-[10px] font-medium tracking-wide">
              Projector
            </span>
          </button>

          <button
            onClick={toggleRemoteFullscreen}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.04] bg-white/[0.02] py-3 text-slate-400 transition hover:bg-white/[0.04] hover:text-white active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span className="mt-1.5 text-[10px] font-medium tracking-wide">
              {isFullscreen ? "Exit Full" : "Handset Full"}
            </span>
          </button>

          <button
            onClick={() => send("reset")}
            className="flex flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/[0.02] py-3 text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400 active:scale-95"
          >
            <RotateCcw size={16} />
            <span className="mt-1.5 text-[10px] font-medium tracking-wide">
              Reset Deck
            </span>
          </button>
        </section>

        <footer className="pt-5">
          <div className="mx-auto h-1 w-20 rounded-full bg-slate-800" />
        </footer>
      </section>
    </main>
  );
}
