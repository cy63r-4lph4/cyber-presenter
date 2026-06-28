import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Users } from "lucide-react";
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
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-1 flex-col items-center justify-center font-mono"
    >
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded border border-violet-500/25 bg-violet-950/30 px-3 py-1.5 text-[10px] tracking-widest text-violet-400 uppercase">
        <span className={`h-2 w-2 rounded-full bg-violet-400 ${quiz.isOpen ? "animate-pulse" : ""}`} />
        <span>
          {quiz.revealed
            ? "ANSWER_REVEALED // RESULT"
            : quiz.isOpen
              ? "LIVE_QUIZ // VOTING_OPEN"
              : "QUIZ // VOTING_CLOSED"}
        </span>
      </div>

      {/* Question card */}
      <div className="relative w-full max-w-4xl rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-10 py-8 backdrop-blur-sm mb-8">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-violet-400 rounded-tl" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-violet-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-violet-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-violet-400 rounded-br" />

        <p className="text-3xl font-black leading-snug tracking-tight text-white text-center normal-case">
          {quiz.prompt}
        </p>
      </div>

      {/* Options */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
        {quiz.options.map((option, index) => {
          const count = counts[index];
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isCorrect = quiz.revealed && index === quiz.correctIndex;
          const isWrong = quiz.revealed && index !== quiz.correctIndex;

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl border transition-colors duration-500 ${
                isCorrect
                  ? "border-emerald-400/40 bg-emerald-950/20"
                  : isWrong
                    ? "border-slate-800/60 bg-slate-900/20 opacity-50"
                    : "border-violet-500/15 bg-violet-500/[0.04]"
              }`}
            >
              {/* Fill bar */}
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  isCorrect ? "bg-emerald-400/10" : "bg-violet-400/8"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              <div className="relative flex items-center gap-4 px-5 py-4">
                {/* Letter badge */}
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-black ${
                    isCorrect
                      ? "bg-emerald-400/20 text-emerald-300"
                      : isWrong
                        ? "bg-slate-800/60 text-slate-500"
                        : "bg-violet-500/15 text-violet-300"
                  }`}
                >
                  {optionLetters[index] ?? index + 1}
                </span>

                {/* Option text */}
                <p
                  className={`flex-1 text-base font-bold normal-case leading-snug ${
                    isCorrect
                      ? "text-emerald-200"
                      : isWrong
                        ? "text-slate-500"
                        : "text-slate-200"
                  }`}
                >
                  {option}
                </p>

                {/* Right side: icon + pct */}
                <div className="shrink-0 flex items-center gap-2">
                  <AnimatePresence>
                    {isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      </motion.div>
                    )}
                    {isWrong && (
                      <XCircle size={16} className="text-slate-600" />
                    )}
                  </AnimatePresence>
                  <div className="text-right min-w-[48px]">
                    <p className={`text-xl font-black ${isCorrect ? "text-emerald-300" : "text-slate-300"}`}>
                      {pct}%
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600">
                      {count} vote{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.3em] text-violet-500/50 uppercase">
        <span className="h-px w-8 bg-violet-500/30" />
        <Users size={12} className="text-violet-400/60" />
        <span>{totalVotes} response{totalVotes !== 1 ? "s" : ""}</span>
        <span className="h-px w-8 bg-violet-500/30" />
      </div>
    </motion.section>
  );
}