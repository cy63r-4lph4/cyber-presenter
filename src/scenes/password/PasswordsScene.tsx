import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, RefreshCw, Repeat, ShieldOff } from "lucide-react";
import type { SceneProps } from "../../shared/types/presentation";

export function PasswordsScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 4);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-[25%] h-96 w-96 rounded-full bg-amber-500/5 blur-[160px]" />
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
            <p className="text-sm uppercase tracking-[0.6em] text-amber-400 font-bold">
              [ CREDENTIAL_LAYER // CASE_STUDY ]
            </p>
            <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase">
              The Broken
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-amber-400 uppercase drop-shadow-[0_0_40px_rgba(251,191,36,0.3)]">
              Key Problem
            </h1>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="memory-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-3xl"
          >
            <KeyRound size={48} className="mx-auto mb-8 text-slate-500" />
            <p className="text-3xl text-slate-300 leading-relaxed">
              A password is not protection.
            </p>
            <p className="mt-4 text-5xl font-black text-white uppercase">
              It is a memory.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="reused-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-3xl"
          >
            <Repeat size={48} className="mx-auto mb-8 text-amber-400" />
            <p className="text-5xl font-black text-amber-400 uppercase drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              And memories
            </p>
            <p className="mt-2 text-5xl font-black text-white uppercase">
              get reused.
            </p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="reuse-chain"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl font-mono"
          >
            <p className="text-center text-sm uppercase tracking-[0.5em] text-slate-500 mb-10">
              One Password. Every Account.
            </p>
            <div className="flex flex-col items-center gap-3">
              {["Email", "Banking", "Work Login", "Social Media"].map((service, i) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-4 w-full rounded-xl border border-amber-500/20 bg-amber-950/10 px-6 py-3"
                >
                  <span className="text-xs text-slate-500 w-28 shrink-0">{service}</span>
                  <span className="text-white font-bold tracking-widest">••••••••</span>
                  {i > 0 && (
                    <span className="ml-auto text-[10px] text-amber-400 uppercase">
                      same password
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="stuffing-attack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <ShieldOff size={48} className="mx-auto mb-6 text-red-400" />
            <p className="text-sm uppercase tracking-[0.5em] text-red-400 font-bold mb-4">
              [ CREDENTIAL_STUFFING // ATTACK_FLOW ]
            </p>
            <h1 className="text-4xl font-black text-white uppercase leading-relaxed">
              One breach leaks your password.<br />
              <span className="text-red-400">
                Attackers try it everywhere else.
              </span>
            </h1>
            <div className="mt-8 flex items-center justify-center gap-3 text-slate-500 text-xs uppercase tracking-widest">
              <RefreshCw size={14} className="animate-spin" />
              Automated. At scale. In seconds.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}