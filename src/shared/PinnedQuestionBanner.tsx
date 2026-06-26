import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import type { AudienceQuestion } from "./types/presentation";

type PinnedQuestionBannerProps = {
  pinnedQuestion: AudienceQuestion | null;
  suppress: boolean;
};

export function PinnedQuestionBanner({
  pinnedQuestion,
  suppress,
}: PinnedQuestionBannerProps) {
  return (
    <AnimatePresence>
      {pinnedQuestion && !suppress && (
        <motion.div
          key={pinnedQuestion.id}
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-5 flex items-start gap-4 rounded-[2rem] border border-purple-400/25 bg-purple-400/[0.08] px-7 py-5 backdrop-blur-xl"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple-400/15 text-purple-300">
            <HelpCircle size={22} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-300">
              Question from {pinnedQuestion.participantName}
            </p>
            <p className="mt-1.5 text-2xl font-black leading-snug text-white">
              {pinnedQuestion.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}