import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  HelpCircle,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { socket } from "../socket";
import type { QuizQuestion, QuizVote } from "../shared/types/presentation";
import type { TournamentState } from "../shared/types/Tournament";
import { AudienceTournament } from "../scenes/quiz/AudienceTournament";

type Participant = {
  id: string;
  name: string;
};

type LiveQuestion = {
  id: string;
  prompt: string;
  type: "short-text";
  isOpen: boolean;
};

type PresentationState = {
  currentSlide: number;
};

type AudienceTab = "answer" | "ask";

const optionLetters = ["A", "B", "C", "D"];

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

  // Quiz state
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

    socket.on("state:update", (s: PresentationState) => {
      setSlideIndex(s.currentSlide);
    });

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
    socket.emit("audience:join", name);
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
    ? quizVotes.find(
        (vote) =>
          vote.quizId === quiz.id && vote.participantId === participant?.id,
      )
    : undefined;

  if (!participant) {
    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <ShieldCheck />
          </div>

          <h1 className="text-3xl font-black">Join the session</h1>
          <p className="mt-3 text-slate-400">
            Enter your first name so your answers can be tracked during the
            training.
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="First name"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-white outline-none focus:border-cyan-400/40"
          />

          <button
            onClick={join}
            className="mt-4 w-full rounded-2xl bg-white px-5 py-4 font-bold text-black"
          >
            Join Session
          </button>
        </section>
      </main>
    );
  }

  if (tournament && tournament.phase !== "idle" && participant) {
    return <AudienceTournament state={tournament} participant={participant} />;
  }
  // ── Quiz takeover ──────────────────────────────────────────────────────
  // Fully replaces the screen while a quiz is active, per design — a quiz
  // is the main event, not something to squeeze into the existing tabs.
  if (quiz) {
    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-200">
            {quiz.revealed
              ? "Answer revealed"
              : quiz.isOpen
                ? "Quiz — tap your answer"
                : "Voting closed"}
          </div>

          <h1 className="text-2xl font-black leading-snug">{quiz.prompt}</h1>

          <div className="mt-6 space-y-3">
            {quiz.options.map((option, index) => {
              const isMine = myVote?.optionIndex === index;
              const isCorrect = quiz.revealed && index === quiz.correctIndex;
              const isWrongAndMine = quiz.revealed && isMine && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => voteQuiz(index)}
                  disabled={!quiz.isOpen}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.98] disabled:active:scale-100 ${
                    isCorrect
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : isWrongAndMine
                        ? "border-red-400/40 bg-red-400/10"
                        : isMine
                          ? "border-cyan-300/40 bg-cyan-300/10"
                          : "border-white/10 bg-white/[0.05]"
                  } ${!quiz.isOpen && !isMine ? "opacity-50" : ""}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                      isCorrect
                        ? "bg-emerald-300/20 text-emerald-200"
                        : isMine
                          ? "bg-cyan-300/20 text-cyan-200"
                          : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {optionLetters[index] ?? index + 1}
                  </span>

                  <span className="flex-1 font-semibold text-white">
                    {option}
                  </span>

                  {isMine && !quiz.revealed && (
                    <span className="shrink-0 text-xs font-bold text-cyan-300">
                      Your pick
                    </span>
                  )}
                  {isCorrect && (
                    <CheckCircle2
                      size={20}
                      className="shrink-0 text-emerald-300"
                    />
                  )}
                  {isWrongAndMine && (
                    <XCircle size={20} className="shrink-0 text-red-300" />
                  )}
                </button>
              );
            })}
          </div>

          {!myVote && quiz.isOpen && (
            <p className="mt-5 text-center text-sm text-slate-500">
              Tap an answer to lock in your vote.
            </p>
          )}

          {myVote && quiz.isOpen && (
            <p className="mt-5 text-center text-sm text-cyan-300">
              Vote submitted — you can change it until voting closes.
            </p>
          )}

          {!quiz.isOpen && !quiz.revealed && (
            <p className="mt-5 text-center text-sm text-slate-500">
              Waiting for the trainer to reveal the answer.
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
      <section className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Signed in as</p>
            <h1 className="text-2xl font-black">{participant.name}</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1">
            <button
              onClick={() => setActiveTab("answer")}
              className={`relative rounded-xl px-3 py-2 text-xs font-bold transition ${
                activeTab === "answer"
                  ? "bg-white text-slate-950"
                  : "text-slate-400"
              }`}
            >
              Respond
              {question?.isOpen && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("ask")}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                activeTab === "ask"
                  ? "bg-white text-slate-950"
                  : "text-slate-400"
              }`}
            >
              Ask
            </button>
          </div>
        </div>

        {/* ── Respond tab ──────────────────────────────────────────────────── */}
        {activeTab === "answer" && (
          <>
            {!question && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-slate-300">No active question yet.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Keep this page open. A question will appear when the trainer
                  activates one.
                </p>
              </div>
            )}

            {question && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Live Question
                </p>

                <h2 className="mt-4 text-2xl font-black leading-tight">
                  {question.prompt}
                </h2>

                {!question.isOpen && (
                  <p className="mt-5 rounded-2xl bg-red-400/10 p-4 text-sm text-red-200">
                    This question has been closed.
                  </p>
                )}

                {question.isOpen && !submitted && (
                  <>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      rows={5}
                      className="mt-6 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-cyan-400/40"
                    />

                    <button
                      onClick={submitAnswer}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950"
                    >
                      <Send size={18} />
                      Submit Answer
                    </button>
                  </>
                )}

                {submitted && (
                  <p className="mt-6 rounded-2xl bg-emerald-400/10 p-4 text-emerald-300">
                    Answer submitted. Nice.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Ask a question tab ────────────────────────────────────────────── */}
        {activeTab === "ask" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#10151f] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-purple-400/10 text-purple-300">
                <HelpCircle size={20} />
              </div>
              <div>
                <p className="font-black">Got a question?</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  The trainer will see it and can address it when ready.
                </p>
              </div>
            </div>

            {!questionSent ? (
              <>
                <textarea
                  value={myQuestion}
                  onChange={(e) => setMyQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-white outline-none focus:border-purple-400/40"
                />

                <button
                  onClick={submitMyQuestion}
                  disabled={!myQuestion.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-300 px-5 py-4 font-black text-slate-950 disabled:opacity-40"
                >
                  <Send size={18} />
                  Send Question
                </button>
              </>
            ) : (
              <div className="rounded-2xl bg-purple-400/10 p-5 text-center">
                <p className="font-black text-purple-200">Question sent!</p>
                <p className="mt-1 text-sm text-slate-400">
                  The trainer will pick it up. You can ask another shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
