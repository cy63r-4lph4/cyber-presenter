import { AnimatePresence, motion } from "framer-motion";
import { Clock, ShieldAlert, UserCog, Zap } from "lucide-react";
import type { SceneProps } from "../../shared/types/presentation";

export function SocialEngineeringScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 4);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[25%] top-[20%] h-96 w-96 rounded-full bg-red-500/5 blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-4xl"
          >
            <p className="text-sm uppercase tracking-[0.6em] text-red-400 font-bold">
              [ HUMAN_LAYER // CASE_STUDY ]
            </p>
            <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase">
              The Human
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-red-400 uppercase drop-shadow-[0_0_40px_rgba(248,113,113,0.3)]">
              Exploit
            </h1>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="confident-line"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <p className="text-3xl text-slate-300">No system is hacked faster</p>
            <p className="mt-3 text-5xl font-black text-white uppercase">
              than a confident human.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="impersonation"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <UserCog size={48} className="mx-auto mb-6 text-red-400" />
            <p className="text-sm uppercase tracking-[0.5em] text-red-400 font-bold mb-4">
              [ TACTIC // IMPERSONATION ]
            </p>
            <h1 className="text-5xl font-black text-white uppercase leading-tight">
              "Hi, this is IT calling
              <br />
              about your account."
            </h1>
            <p className="mt-6 text-slate-400 text-lg">
              Borrowed authority. Zero verification.
            </p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="urgency"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <Clock size={48} className="mx-auto mb-6 text-amber-400 animate-pulse" />
            <p className="text-sm uppercase tracking-[0.5em] text-amber-400 font-bold mb-4">
              [ TACTIC // URGENCY PRESSURE ]
            </p>
            <h1 className="text-5xl font-black text-white uppercase leading-tight">
              "You have 10 minutes
              <br />
              before access is revoked."
            </h1>
            <p className="mt-6 text-slate-400 text-lg">
              Panic shuts down judgment. That's the design.
            </p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="discomfort"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <ShieldAlert size={48} className="mx-auto mb-6 text-red-400" />
            <h1 className="text-4xl font-black text-white uppercase leading-relaxed">
              Every tactic you just saw
              <br />
              <span className="text-red-400">has worked on someone in this room.</span>
            </h1>
            <p className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-widest">
              <Zap size={14} />
              Uncomfortable is the point.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}