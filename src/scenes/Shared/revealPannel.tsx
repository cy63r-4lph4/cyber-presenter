import { motion, AnimatePresence } from "framer-motion";
import { KeyRound } from "lucide-react";

type RevealPanelProps = {
  items: string[];
  /** 1-indexed step from PresentationState.revealStep. 0 means nothing revealed yet. */
  revealStep: number;
};

/**
 * Visually distinct from the question/quiz cards on purpose: amber instead
 * of cyan/purple, sharper corners, and a step-dot row so the room can see
 * "we're on reveal 2 of 4" without reading anything.
 */
export function RevealPanel({ items, revealStep }: RevealPanelProps) {
  if (items.length === 0 || revealStep <= 0) return null;

  const index = Math.min(revealStep, items.length) - 1;
  const current = items[index];

  return (
    <div className="mt-10 max-w-3xl rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-300/15 text-amber-200">
          <KeyRound size={22} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
              Reveal
            </p>

            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full transition-colors ${
                    i <= index ? "bg-amber-300" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-3 text-xl leading-8 text-amber-50"
            >
              {current}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}