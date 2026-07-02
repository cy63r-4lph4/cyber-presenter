import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Terminal } from "lucide-react";
import { socket } from "../socket";
import { scenes, getScene } from "../scenes/sceneRegistry";
import { getAccentGradient } from "../scenes/accent";
import QRCode from "qrcode";

import type {
  AudienceAnswer,
  AudienceQuestion,
  LiveQuestion,
  PresentationState,
  QuizQuestion,
  QuizVote,
} from "../shared/types/presentation";
import { QuizScene } from "../scenes/quiz/QuizScene";
import { AudienceWall } from "../scenes/Shared/audienceWall";
import { IntroScene } from "../scenes/intro/IntroScene";
import { TOURNAMENT_INITIAL_STATE } from "../shared/types/Tournament";
import type { TournamentState } from "../shared/types/Tournament";
import { TournamentScene } from "../scenes/quiz/TournamentScene";
import { PinnedQuestionDisplay } from "../scenes/Shared/PinnedQuestionDisplay";
import { useTournamentAudio } from "../hooks/useTournamentAudio";

export function Display() {
  const [state, setState] = useState<PresentationState>({
    currentSlide: 0,
    revealStep: 0,
    sceneStep: 0,
    mode: "presenting",
  });

  const [question, setQuestion] = useState<LiveQuestion | null>(null);
  const [answers, setAnswers] = useState<AudienceAnswer[]>([]);
  const [audienceQuestions, setAudienceQuestions] = useState<
    AudienceQuestion[]
  >([]);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [quizVotes, setQuizVotes] = useState<QuizVote[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState>(
    TOURNAMENT_INITIAL_STATE,
  );
  const [qrSvg, setQrSvg] = useState<string>("");
  const { unlocked } = useTournamentAudio(tournamentState.phase);
  console.log("Tournament audio unlocked:", unlocked);

  const audienceUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    // return `${window.location.protocol}//${window.location.host}/audience`;
    return "https://cyber-presenter.vercel.app/audience";
  }, []);

  useEffect(() => {
    if (!audienceUrl) return;
    let cancelled = false;
    QRCode.toString(audienceUrl, {
      type: "svg",
      margin: 1,
      color: { dark: "#020617", light: "#ffffff" },
    })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch((err) => {
        console.error("Failed to generate lobby QR code:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [audienceUrl]);

  useEffect(() => {
    socket.on("state:update", setState);
    socket.on("question:update", setQuestion);
    socket.on("answers:update", setAnswers);
    socket.on("audience-questions:update", setAudienceQuestions);
    socket.on("quiz:update", setQuiz);
    socket.on("quiz-votes:update", setQuizVotes);
    socket.on("tournament:state", setTournamentState);

    const onPresentationCommand = (command: string) => {
      if (command === "display-fullscreen") {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    socket.on("presentation:command", onPresentationCommand);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") socket.emit("remote:command", "next");
      if (event.key === "ArrowLeft") socket.emit("remote:command", "prev");
      if (event.key.toLowerCase() === "r")
        socket.emit("remote:command", "reveal");
      if (event.key.toLowerCase() === "b")
        socket.emit("remote:command", "blackout");
      if (event.key.toLowerCase() === "f")
        document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      socket.off("state:update", setState);
      socket.off("question:update", setQuestion);
      socket.off("answers:update", setAnswers);
      socket.off("audience-questions:update", setAudienceQuestions);
      socket.off("quiz:update", setQuiz);
      socket.off("quiz-votes:update", setQuizVotes);
      socket.off("tournament:state", setTournamentState);
      socket.off("presentation:command", onPresentationCommand);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const slideIndex = Math.min(state.currentSlide, scenes.length - 1);
  const scene = getScene(slideIndex);
  const progress = ((slideIndex + 1) / scenes.length) * 100;

  const pendingQuestionsCount = useMemo(
    () => audienceQuestions.filter((q) => q.status === "pending").length,
    [audienceQuestions],
  );

  const visibleAnswers = useMemo(
    () => answers.filter((a) => a.visible),
    [answers],
  );

  const pinnedQuestion = useMemo(
    () => audienceQuestions.find((q) => q.pinned) ?? null,
    [audienceQuestions],
  );

  const shouldShowAudienceWall = Boolean(question && visibleAnswers.length > 0);
  const shouldShowQuiz = Boolean(quiz);

  // Show tournament on Display for every phase EXCEPT "idle"
  // "lobby" is the presenter-activated arena screen before bracket setup
  const shouldShowTournament = tournamentState.phase !== "idle";

  const isIntroScene = scene.component === IntroScene || slideIndex === 0;
  const isInteractiveScene = shouldShowQuiz || shouldShowAudienceWall;
  const shouldShowChrome =
    !isIntroScene && !isInteractiveScene && !shouldShowTournament;

  const accent = useMemo(() => getAccentGradient(slideIndex), [slideIndex]);

  // ── Blackout ────────────────────────────────────────────────────────────────
  if (state.mode === "blackout") {
    return (
      <main className="fixed inset-0 grid place-items-center bg-black text-emerald-500 font-mono">
        <div className="flex flex-col items-center gap-2">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
          <p className="text-xs uppercase tracking-[0.6em] text-emerald-500/40">
            Console Suspended // Feed Paused
          </p>
        </div>
      </main>
    );
  }

  // ── Audience join lobby (QR screen) ────────────────────────────────────────
  if (state.mode === "lobby") {
    return (
      <main className="fixed inset-0 flex flex-col items-center justify-center bg-[#020617] text-slate-100 font-mono select-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute left-[15%] top-[20%] h-96 w-96 rounded-full bg-cyan-500/5 blur-[160px]" />
        <div className="absolute right-[15%] bottom-[20%] h-96 w-96 rounded-full bg-blue-500/5 blur-[160px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl px-8"
        >
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-[10px] tracking-widest text-cyan-400 uppercase mb-6">
              <Terminal size={12} className="animate-pulse" />
              <span>GATEWAY_INITIALIZATION // LIVE_PORTAL</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white uppercase">
              Join The Active Session
            </h1>
            <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto">
              Scan the matrix node or enter the access URL on your device to
              synchronize with the room.
            </p>
          </div>

          <div className="grid md:grid-cols-[auto_1fr] gap-12 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="relative mx-auto p-5 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-[0_0_60px_-15px_rgba(34,211,238,0.15)] backdrop-blur-sm"
            >
              <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm" />
              <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-cyan-400 rounded-br-sm" />
              <div className="bg-white p-4 rounded-xl shadow-inner relative overflow-hidden">
                <div className="absolute left-0 right-0 h-[2px] bg-cyan-400 top-0 shadow-[0_0_8px_#22d3ee] animate-[bounce_3s_infinite_linear] z-10" />
                {qrSvg ? (
                  <div
                    className="w-52 h-52"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-52 h-52 grid place-items-center text-slate-400 text-xs uppercase tracking-widest">
                    Generating...
                  </div>
                )}
              </div>
              <p className="mt-4 text-center text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
                Scan To Connect
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-5 max-w-md mx-auto md:mx-0"
            >
              <div className="rounded-xl border border-slate-800 bg-[#030712] p-5">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest block mb-2">
                  // Access URL Host
                </span>
                <span className="text-cyan-400 font-bold text-lg select-all break-all leading-snug">
                  {audienceUrl || "Resolving host..."}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-950/20 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse" />
                <p className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
                  Awaiting Payloads
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Interactive System Ready
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    );
  }

  const SceneComponent = scene.component;

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#020617] text-slate-100 select-none selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" />

      <div className="relative z-10 flex h-screen flex-col px-16 py-10">
        <AnimatePresence>
          {shouldShowChrome && (
            <motion.header
              initial={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className="flex items-start justify-between border-b border-slate-800/60 pb-6"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Terminal size={18} />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-[0.5em] text-cyan-400">
                    SEC-OPS // INTERACTIVE TERMINAL
                  </p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                    Online Safety & Cybersecurity Awareness
                  </h1>
                  <p className="text-sm font-medium text-slate-400">
                    Training the Trainer Session
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-950/30 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  Live Stream
                </div>
                {pendingQuestionsCount > 0 && !pinnedQuestion && (
                  <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-950/30 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                    <ShieldAlert
                      size={14}
                      className="animate-bounce text-amber-400"
                    />
                    <span>[{pendingQuestionsCount}] Inbound Broadcasts</span>
                  </div>
                )}
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="relative my-8 flex flex-1 min-h-0 flex-col justify-center">
          <AnimatePresence mode="wait">
            {shouldShowTournament ? (
              <motion.div
                key={`tournament-${tournamentState.phase}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-1"
              >
                <TournamentScene state={tournamentState} />
              </motion.div>
            ) : pinnedQuestion && !shouldShowAudienceWall && !shouldShowQuiz ? (
              // ← NEW: pinned question takes over the display
              <PinnedQuestionDisplay question={pinnedQuestion} />
            ) : shouldShowQuiz && quiz ? (
              <QuizScene quiz={quiz} votes={quizVotes} />
            ) : shouldShowAudienceWall ? (
              <AudienceWall question={question} answers={answers} />
            ) : (
              <motion.div
                key={`slide-${slideIndex}`}
                initial={{ opacity: 0, x: 15, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -15, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex flex-1"
              >
                <SceneComponent
                  slideIndex={slideIndex}
                  revealStep={state.revealStep}
                  sceneStep={state.sceneStep}
                  mode={state.mode}
                  question={question}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {shouldShowChrome && (
            <motion.footer
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className="border-t border-slate-800/60 pt-6"
            >
              <div className="flex items-center justify-between gap-8">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${accent} shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-500 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-slate-400">
                  <span className="text-cyan-400">
                    INDEX_{String(slideIndex + 1).padStart(2, "0")}
                  </span>
                  <ArrowRight size={12} className="text-slate-600" />
                  <span>TOTAL_{String(scenes.length).padStart(2, "0")}</span>
                </div>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
