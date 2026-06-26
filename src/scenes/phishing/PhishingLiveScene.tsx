import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldAlert, UserCheck } from "lucide-react";
import { socket } from "../../socket";
import type { PhishCapture, SceneProps } from "../../shared/types/presentation";

export function PhishingLiveScene({ sceneStep }: SceneProps) {
  const [captures, setCaptures] = useState<PhishCapture[]>([]);

  useEffect(() => {
    socket.on("phish-captures:update", setCaptures);
    return () => {
      socket.off("phish-captures:update", setCaptures);
    };
  }, []);

  // sceneStep 0 = waiting/live feed, 1 = debrief transition
  const showDebrief = sceneStep >= 1;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-red-500/5 blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {!showDebrief ? (
          <motion.div
            key="live-feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl font-mono"
          >
            <div className="text-center mb-10">
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-sm uppercase tracking-[0.6em] text-red-400 font-bold"
              >
                [ LIVE_FEED // PHISHING_SIMULATION ]
              </motion.p>
              <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase">
                {captures.length}
              </h1>
              <p className="mt-2 text-lg text-slate-400 uppercase tracking-widest">
                {captures.length === 1 ? "Person Caught" : "People Caught"}
              </p>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-hidden">
              <AnimatePresence>
                {captures
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((capture) => (
                    <motion.div
                      key={capture.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-950/10 px-6 py-3"
                    >
                      <ShieldAlert size={18} className="text-red-400 shrink-0" />
                      <p className="text-base text-white">
                        <span className="text-slate-400">{capture.emailTyped}</span>
                        {capture.passwordEntered && (
                          <span className="ml-3 text-red-400 font-bold uppercase text-xs tracking-wide">
                            Credentials Entered
                          </span>
                        )}
                      </p>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            <p className="mt-10 text-center text-xs text-slate-500 uppercase tracking-widest">
              Waiting for clicks from the room…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="debrief"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-3xl"
          >
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
                <Mail size={32} />
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.5em] text-red-400 font-bold">
              [ THE_FAKE_DOOR ]
            </p>
            <h1 className="mt-6 text-6xl font-black tracking-tight text-white uppercase leading-tight">
              {captures.length} of you
            </h1>
            <h1 className="text-6xl font-black tracking-tight text-red-400 uppercase leading-tight">
              just got phished.
            </h1>
            <p className="mt-8 text-xl text-slate-400 max-w-xl mx-auto">
              One email. One link. No exploit code, no malware — just
              trust, used against you.
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-emerald-400">
              <UserCheck size={16} />
              No real credentials were captured — this scene only counts
              clicks.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}