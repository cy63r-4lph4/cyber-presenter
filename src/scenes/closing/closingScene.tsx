import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { SceneProps } from "../../shared/types/presentation";

const QUOTE =
  "Cybersecurity isn't about stopping hackers.\nIt's about protecting people.";

export function ClosingScene(_: SceneProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#04070d]">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.14, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 blur-[220px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#04070d_80%)]" />
      </div>

      <div className="relative z-10 flex max-w-5xl flex-col items-center px-10 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .7 }}
          className="mb-12 flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10"
        >
          <ShieldCheck
            size={48}
            className="text-cyan-300"
            strokeWidth={1.6}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .15 }}
          className="mb-6 font-mono text-xs uppercase tracking-[0.55em] text-cyan-400"
        >
          FINAL THOUGHT
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: .9,
            delay: .25,
            ease: [0.16,1,0.3,1],
          }}
          className="whitespace-pre-line text-6xl font-black leading-tight tracking-tight text-white"
        >
          {QUOTE}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: .9, duration: .7 }}
          className="my-12 h-px w-32 origin-center bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-2"
        >
          <p className="text-lg tracking-[0.25em] uppercase text-slate-400">
            Stay Curious.
          </p>

          <p className="text-lg tracking-[0.25em] uppercase text-slate-400">
            Stay Vigilant.
          </p>

          <p className="text-lg tracking-[0.25em] uppercase text-cyan-300">
            Stay Secure.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: .75 }}
          transition={{ delay: 1.8 }}
          className="mt-16 font-mono text-sm tracking-[0.3em] uppercase text-slate-500"
        >
          — Emmanuel Barry
        </motion.p>

      </div>
    </div>
  );
}