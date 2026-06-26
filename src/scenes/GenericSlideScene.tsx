import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { visualIcons } from "./visualIcons";
import { getAccentGradient } from "./accent";
import { RevealPanel } from "./Shared/RevealPanel";
import { scenes } from "../data/scenes";
import type { SceneProps } from "../shared/types/presentation";

type GenericSlideSceneProps = SceneProps & {
  title: string;
  subtitle: string;
  revealItems: string[];
};

/**
 * The default simple-slide renderer. Unlike before, this no longer indexes
 * into a global `slides` array — title/subtitle/revealItems are passed in
 * directly by the genericSlide() factory in data/scenes.ts. That's what
 * lets bespoke scenes coexist in the same registry without this component
 * needing to know how many "real" slides vs bespoke scenes exist.
 */
export function GenericSlideScene({
  slideIndex,
  revealStep,
  question,
  title,
  subtitle,
  revealItems,
}: GenericSlideSceneProps) {
  const Icon = visualIcons[slideIndex % visualIcons.length];
  const accent = useMemo(() => getAccentGradient(slideIndex), [slideIndex]);

  return (
    <div className="grid flex-1 grid-cols-[1.1fr_0.9fr] items-center gap-12">
      <div>
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${accent}`} />
          <span className="text-sm font-bold text-slate-300">
            Section {slideIndex + 1} of {scenes.length}
          </span>
        </div>

        <h1 className="max-w-5xl text-7xl font-black leading-[0.95] tracking-tight">
          {title}
        </h1>

        <p className="mt-8 max-w-3xl text-3xl leading-relaxed text-slate-300">
          {subtitle}
        </p>

        {question && (
          <div className="mt-10 max-w-3xl rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-200">
                <MessageSquareText />
              </div>
              <div>
                <p className="text-lg font-black text-cyan-100">
                  Live audience question
                </p>
                <p className="mt-2 text-lg leading-8 text-slate-300">
                  {question.prompt}
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  Waiting for selected answers to appear on screen.
                </p>
              </div>
            </div>
          </div>
        )}

        <RevealPanel items={revealItems} revealStep={revealStep} />
      </div>

      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-2xl">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30">
            <div className="absolute h-[78%] w-[78%] rounded-full border border-cyan-300/20" />
            <div className="absolute h-[58%] w-[58%] rounded-full border border-purple-300/20" />
            <div className="absolute h-[38%] w-[38%] rounded-full border border-white/10" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-[70%] w-[70%] rounded-full border-t border-cyan-300/70"
            />

            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.8, repeat: Infinity }}
              className={`grid h-44 w-44 place-items-center rounded-[3rem] bg-gradient-to-br ${accent} text-slate-950 shadow-2xl`}
            >
              <Icon size={82} strokeWidth={1.6} />
            </motion.div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {["Verify", "Protect", "Report"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center"
              >
                <p className="text-sm font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}