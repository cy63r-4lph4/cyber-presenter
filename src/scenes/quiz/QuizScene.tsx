import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Users, XCircle } from "lucide-react";
import type { QuizQuestion, QuizVote } from "../../shared/types/presentation";
type QuizSceneProps = {
  quiz: QuizQuestion;
  votes: QuizVote[];
};

const optionLetters = ["A", "B", "C", "D"];

export function QuizScene({ quiz, votes }: QuizSceneProps) {
  const totalVotes = votes.length;

  const counts = quiz.options.map(
    (_, index) => votes.filter((vote) => vote.optionIndex === index).length,
  );

  return (
    <motion.section
      key="quiz-scene"
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-1 flex-col items-center justify-center"
    >
      <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-purple-300/25 bg-purple-300/10 px-5 py-3 backdrop-blur-xl">
        <Sparkles size={18} className="text-purple-200" />
        <span className="text-sm font-bold text-purple-100">
          {quiz.revealed
            ? "Answer Revealed"
            : quiz.isOpen
              ? "Quiz — Vote Now"
              : "Voting Closed"}
        </span>
      </div>

      <h1 className="max-w-4xl text-center text-5xl font-black leading-tight tracking-tight">
        {quiz.prompt}
      </h1>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4">
        {quiz.options.map((option, index) => {
          const count = counts[index];
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isCorrect = quiz.revealed && index === quiz.correctIndex;
          const isWrong = quiz.revealed && index !== quiz.correctIndex;

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-colors ${
                isCorrect
                  ? "border-emerald-300/40 bg-emerald-300/[0.08]"
                  : isWrong
                    ? "border-white/10 bg-white/[0.03] opacity-60"
                    : "border-purple-300/20 bg-purple-300/[0.06]"
              }`}
            >
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  isCorrect ? "bg-emerald-300/15" : "bg-purple-300/10"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black ${
                      isCorrect
                        ? "bg-emerald-300/20 text-emerald-200"
                        : "bg-white/10 text-slate-200"
                    }`}
                  >
                    {optionLetters[index] ?? index + 1}
                  </span>
                  <p className="text-xl font-bold text-white">{option}</p>
                  {isCorrect && (
                    <CheckCircle2 size={22} className="text-emerald-300" />
                  )}
                  {isWrong && <XCircle size={18} className="text-slate-500" />}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black text-white">{pct}%</p>
                  <p className="text-xs text-slate-400">
                    {count} vote{count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-2 text-sm font-bold text-slate-400">
        <Users size={16} className="text-purple-300" />
        {totalVotes} response{totalVotes !== 1 ? "s" : ""}
      </div>
    </motion.section>
  );
}