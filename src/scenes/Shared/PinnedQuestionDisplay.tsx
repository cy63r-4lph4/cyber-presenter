import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import type { AudienceQuestion } from "../../shared/types/presentation";

type Props = {
  question: AudienceQuestion;
};

export function PinnedQuestionDisplay({ question }: Props) {
  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-1 flex-col items-center justify-center font-mono"
    >
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded border border-purple-500/25 bg-purple-950/30 px-3 py-1.5 text-[10px] tracking-widest text-purple-400 uppercase">
        <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
        <span>AUDIENCE_ASK // LIVE_RELAY</span>
      </div>

      {/* Question card */}
      <div className="relative max-w-3xl w-full rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] px-12 py-10 text-center backdrop-blur-sm">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-purple-400 rounded-tl" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-purple-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-purple-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-purple-400 rounded-br" />

        {/* Sender */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Pin size={12} className="text-purple-400" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-400">
            From the room · {question.participantName}
          </p>
        </div>

        {/* The question text */}
        <p className="text-4xl font-black leading-snug tracking-tight text-white normal-case">
          {question.text}
        </p>
      </div>

      {/* Footer pulse */}
      <div className="mt-8 flex items-center gap-3 text-[10px] tracking-[0.3em] text-purple-500/50 uppercase">
        <span className="h-px w-8 bg-purple-500/30" />
        Awaiting Response
        <span className="h-px w-8 bg-purple-500/30" />
      </div>
    </motion.section>
  );
}