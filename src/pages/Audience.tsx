import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  HelpCircle,
  Send,
  ShieldCheck,
  Wifi,
  MessageCircle,
  XCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { socket } from "../socket";
import type { QuizQuestion, QuizVote } from "../shared/types/presentation";
import type { TournamentState } from "../shared/types/Tournament";
import { AudienceTournament } from "../scenes/quiz/AudienceTournament";

type Participant = { id: string; name: string };
type LiveQuestion = { id: string; prompt: string; type: "short-text"; isOpen: boolean };
type PresentationState = { currentSlide: number };
type AudienceTab = "answer" | "ask";

const optionLetters = ["A", "B", "C", "D"];

// ── Tiny reusable pill ────────────────────────────────────────────────────────
function StatusPill({ live }: { live: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        live
          ? "bg-emerald-400/10 text-emerald-400"
          : "bg-slate-700/40 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}
      />
      {live ? "Live" : "Standby"}
    </div>
  );
}

export function Audience() {
  const [name, setName] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(() => {
    const stored = localStorage.getItem("cyber-participant");
    return stored ? JSON.parse(stored) : null;
  });

  const [question, setQuestion] = useState<LiveQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<AudienceTab>("answer");
  const [myQuestion, setMyQuestion] = useState("");
  const [questionSent, setQuestionSent] = useState(false);
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const questionCooldown = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [quizVotes, setQuizVotes] = useState<QuizVote[]>([]);

  useEffect(() => {
    socket.on("audience:joined", (joined: Participant) => {
      localStorage.setItem("cyber-participant", JSON.stringify(joined));
      setParticipant(joined);
    });
    socket.on("question:update", (incoming: LiveQuestion | null) => {
      setQuestion(incoming);
      setSubmitted(false);
      setAnswer("");
      if (incoming) setActiveTab("answer");
    });
    socket.on("state:update", (s: PresentationState) => setSlideIndex(s.currentSlide));
    socket.on("quiz:update", setQuiz);
    socket.on("quiz-votes:update", setQuizVotes);
    socket.on("tournament:state", setTournament);

    return () => {
      socket.off("audience:joined");
      socket.off("question:update");
      socket.off("state:update");
      socket.off("quiz:update", setQuiz);
      socket.off("quiz-votes:update", setQuizVotes);
      socket.off("tournament:state", setTournament);
    };
  }, []);

  function join() {
    if (!name.trim()) return;
    socket.emit("audience:join", name.trim());
  }

  function submitAnswer() {
    if (!participant || !question || !answer.trim()) return;
    socket.emit("answer:submit", {
      questionId: question.id,
      participantId: participant.id,
      participantName: participant.name,
      answer,
    });
    setSubmitted(true);
    setAnswer("");
  }

  function submitMyQuestion() {
    if (!participant || !myQuestion.trim()) return;
    socket.emit("audience-question:submit", {
      participantId: participant.id,
      participantName: participant.name,
      text: myQuestion.trim(),
      slideIndex,
    });
    setMyQuestion("");
    setQuestionSent(true);
    if (questionCooldown.current) clearTimeout(questionCooldown.current);
    questionCooldown.current = setTimeout(() => setQuestionSent(false), 4000);
  }

  function voteQuiz(optionIndex: number) {
    if (!participant || !quiz || !quiz.isOpen) return;
    socket.emit("quiz:vote", {
      quizId: quiz.id,
      participantId: participant.id,
      participantName: participant.name,
      optionIndex,
    });
  }

  const myVote = quiz
    ? quizVotes.find((v) => v.quizId === quiz.id && v.participantId === participant?.id)
    : undefined;

  // ── Join screen ───────────────────────────────────────────────────────────
  if (!participant) {
    return (
      <main className="min-h-screen bg-[#07080b] flex flex-col px-6 py-12 text-white">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Logo mark */}
          <div className="mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 ring-1 ring-cyan-500/20">
              <ShieldCheck size={26} className="text-cyan-400" />
            </div>
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Join the<br />
            <span className="text-cyan-400">session.</span>
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Enter your first name to participate in polls, quizzes, and Q&A during the training.
          </p>

          <div className="mt-10 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="Your first name"
              autoFocus
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-colors text-base"
            />
            <button
              onClick={join}
              disabled={!name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 disabled:opacity-30 transition-opacity active:scale-[0.98]"
            >
              Enter Session
              <ChevronRight size={18} />
            </button>
          </div>

          
        </div>
      </main>
    );
  }

  // ── Tournament takeover ───────────────────────────────────────────────────
  if (tournament && tournament.phase !== "idle") {
    return <AudienceTournament state={tournament} participant={participant} />;
  }

  // ── Quiz takeover ─────────────────────────────────────────────────────────
  if (quiz) {
    return (
      <main className="min-h-screen bg-[#07080b] text-white flex flex-col">
        <div className="flex-1 flex flex-col px-5 py-8 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/8 px-3 py-1.5 text-xs font-bold text-violet-300">
              <Sparkles size={12} />
              {quiz.revealed ? "Result" : quiz.isOpen ? "Vote now" : "Closed"}
            </div>
            <StatusPill live={quiz.isOpen} />
          </div>

          {/* Question */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-3">
              Quiz question
            </p>
            <h2 className="text-2xl font-black leading-snug">{quiz.prompt}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {quiz.options.map((option, index) => {
              const isMine = myVote?.optionIndex === index;
              const isCorrect = quiz.revealed && index === quiz.correctIndex;
              const isWrongAndMine = quiz.revealed && isMine && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => voteQuiz(index)}
                  disabled={!quiz.isOpen}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.98] disabled:active:scale-100 ${
                    isCorrect
                      ? "border-emerald-400/40 bg-emerald-400/8"
                      : isWrongAndMine
                        ? "border-red-400/30 bg-red-400/8"
                        : isMine
                          ? "border-cyan-400/40 bg-cyan-400/8"
                          : "border-white/8 bg-white/[0.03] hover:border-white/15"
                  } ${!quiz.isOpen && !isMine && !isCorrect ? "opacity-40" : ""}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                      isCorrect
                        ? "bg-emerald-400/20 text-emerald-300"
                        : isMine
                          ? "bg-cyan-400/20 text-cyan-300"
                          : "bg-white/8 text-slate-400"
                    }`}
                  >
                    {optionLetters[index] ?? index + 1}
                  </span>

                  <span className={`flex-1 font-semibold leading-snug ${isCorrect ? "text-emerald-100" : isWrongAndMine ? "text-slate-400" : "text-white"}`}>
                    {option}
                  </span>

                  <span className="shrink-0">
                    {isMine && !quiz.revealed && (
                      <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">Your pick</span>
                    )}
                    {isCorrect && <CheckCircle2 size={20} className="text-emerald-400" />}
                    {isWrongAndMine && <XCircle size={20} className="text-red-400" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status hint */}
          <div className="mt-8 text-center">
            {!myVote && quiz.isOpen && (
              <p className="text-sm text-slate-500">Tap an option to lock in your vote</p>
            )}
            {myVote && quiz.isOpen && (
              <p className="text-sm text-cyan-400/80">Voted — you can change until voting closes</p>
            )}
            {!quiz.isOpen && !quiz.revealed && (
              <p className="text-sm text-slate-500">Waiting for the trainer to reveal the answer…</p>
            )}
            {quiz.revealed && (
              <p className="text-sm text-emerald-400/80">
                {myVote?.optionIndex === quiz.correctIndex ? "🎉 You got it right!" : "Better luck next time"}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Main audience view ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#07080b] text-white flex flex-col">
      <div className="flex-1 flex flex-col px-5 pt-8 pb-6 max-w-md mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-0.5">
              Signed in
            </p>
            <p className="text-lg font-black">{participant.name}</p>
          </div>
          <StatusPill live={!!question?.isOpen} />
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1 mb-6">
          <button
            onClick={() => setActiveTab("answer")}
            className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "answer" ? "bg-white text-slate-950" : "text-slate-500"
            }`}
          >
            <Wifi size={12} />
            Respond
            {question?.isOpen && activeTab !== "answer" && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              activeTab === "ask" ? "bg-white text-slate-950" : "text-slate-500"
            }`}
          >
            <MessageCircle size={12} />
            Ask
          </button>
        </div>

        {/* ── Respond tab ──────────────────────────────────────────────── */}
        {activeTab === "answer" && (
          <div className="flex-1 flex flex-col">
            {!question && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <div className="h-16 w-16 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
                  <Wifi size={24} className="text-slate-600" />
                </div>
                <p className="font-bold text-slate-300">No active question</p>
                <p className="mt-2 text-sm text-slate-600 max-w-xs leading-relaxed">
                  Keep this page open. A question will appear here when the trainer activates one.
                </p>
              </div>
            )}

            {question && (
              <div className="flex-1 flex flex-col">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Live Question
                    </p>
                  </div>
                  <h2 className="text-xl font-black leading-snug">{question.prompt}</h2>

                  {!question.isOpen && (
                    <p className="mt-4 text-sm text-red-300/80 font-medium">
                      This question has been closed.
                    </p>
                  )}
                </div>

                {question.isOpen && !submitted && (
                  <div className="flex flex-col gap-3 flex-1">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here…"
                      rows={5}
                      className="flex-1 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-cyan-400/30 focus:bg-white/[0.06] transition-colors text-base leading-relaxed"
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 disabled:opacity-30 active:scale-[0.98] transition-all"
                    >
                      <Send size={16} />
                      Submit Answer
                    </button>
                  </div>
                )}

                {submitted && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 text-center">
                    <CheckCircle2 size={28} className="mx-auto mb-3 text-emerald-400" />
                    <p className="font-black text-emerald-300">Answer submitted!</p>
                    <p className="mt-1 text-sm text-slate-500">
                      The trainer may show it on the main display.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Ask tab ──────────────────────────────────────────────────── */}
        {activeTab === "ask" && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-start gap-3 mb-6">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-purple-400/10 text-purple-300 ring-1 ring-purple-400/15">
                <HelpCircle size={18} />
              </div>
              <div>
                <p className="font-black">Got a question?</p>
                <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">
                  The trainer will see it and can address it when ready.
                </p>
              </div>
            </div>

            {!questionSent ? (
              <div className="flex flex-col gap-3 flex-1">
                <textarea
                  value={myQuestion}
                  onChange={(e) => setMyQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  rows={5}
                  className="flex-1 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white placeholder-slate-600 outline-none focus:border-purple-400/30 focus:bg-white/[0.06] transition-colors text-base leading-relaxed"
                />
                <button
                  onClick={submitMyQuestion}
                  disabled={!myQuestion.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-400 px-5 py-4 font-black text-slate-950 disabled:opacity-30 active:scale-[0.98] transition-all"
                >
                  <Send size={16} />
                  Send Question
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="h-16 w-16 rounded-full bg-purple-400/10 ring-1 ring-purple-400/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-purple-300" />
                </div>
                <p className="font-black text-purple-200">Question sent!</p>
                <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                  The trainer will pick it up. You can ask another one shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}