import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import type { AudienceAnswer, LiveQuestion } from "./types/presentation";

const categoryLabel = {
  strong: "Strong responses",
  discussion: "Discussion starters",
  risky: "Risky responses",
  uncategorized: "Live responses",
};

type AudienceWallProps = {
  question: LiveQuestion | null;
  answers: AudienceAnswer[];
};

export function AudienceWall({ question, answers }: AudienceWallProps) {
  const visibleAnswers = answers.filter((answer) => answer.visible);

  const groupedAnswers = useMemo(() => {
    return {
      strong: visibleAnswers.filter((answer) => answer.category === "strong"),
      discussion: visibleAnswers.filter(
        (answer) => answer.category === "discussion",
      ),
      risky: visibleAnswers.filter((answer) => answer.category === "risky"),
      uncategorized: visibleAnswers.filter((answer) => !answer.category),
    };
  }, [visibleAnswers]);

  return (
    <motion.section
      key="audience-wall"
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="grid flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-10"
    >
      <div>
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 backdrop-blur-xl">
          <MessageSquareText size={18} className="text-cyan-200" />
          <span className="text-sm font-bold text-cyan-100">
            Audience Question
          </span>
        </div>

        <h1 className="text-6xl font-black leading-[0.95] tracking-tight">
          {question?.prompt}
        </h1>

        <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-slate-300">
          These are selected responses from the room. Some are strong,
          some are risky, and some are perfect discussion starters.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-3xl font-black text-emerald-200">
              {groupedAnswers.strong.length}
            </p>
            <p className="text-sm text-emerald-100/70">Strong</p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-3xl font-black text-cyan-200">
              {groupedAnswers.discussion.length}
            </p>
            <p className="text-sm text-cyan-100/70">Discuss</p>
          </div>

          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
            <p className="text-3xl font-black text-rose-200">
              {groupedAnswers.risky.length}
            </p>
            <p className="text-sm text-rose-100/70">Risky</p>
          </div>
        </div>
      </div>

      <div className="grid max-h-[72vh] grid-cols-2 gap-4 overflow-hidden">
        {(["strong", "discussion", "risky", "uncategorized"] as const).map(
          (category) => {
            const items = groupedAnswers[category];
            if (items.length === 0) return null;

            return (
              <div
                key={category}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
              >
                <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                  {categoryLabel[category]}
                </p>

                <div className="space-y-3">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <p className="text-sm font-black text-cyan-200">
                        {item.participantName}
                      </p>
                      <p className="mt-2 text-lg leading-7 text-slate-100">
                        "{item.answer}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          },
        )}
      </div>
    </motion.section>
  );
}