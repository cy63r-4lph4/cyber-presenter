import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  ArrowRight,
  ShieldAlert,
  Terminal,
} from "lucide-react";

import type { SceneProps } from "../../shared/types/presentation";
import { socket } from "../../socket";
import { useEffect, useRef } from "react";

export function IntroScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 11);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handler = (payload: { scene: string; command: string }) => {
      if (payload.scene !== "intro") return;

      switch (payload.command) {
        case "play":
          videoRef.current?.play().catch(() => {});
          break;
        case "pause":
          videoRef.current?.pause();
          break;
        case "restart":
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
          break;
      }
    };

    socket.on("scene:video", handler);
    return () => {
      socket.off("scene:video", handler);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Visual Ambient Atmosphere Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-cyan-500/5 blur-[160px]" />
        <div className="absolute right-[20%] bottom-[25%] h-96 w-96 rounded-full bg-blue-500/5 blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Cinematic Fullscreen Video Screen Break */}
        {step === 0 && (
          <motion.div
            key="video-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 -mx-16 -my-10 h-screen w-screen bg-black"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src="/videos/hack.mp4"
              playsInline
              autoPlay // Safe because you trigger it over state synchronization
            />
          </motion.div>
        )}

        {/* STEP 1: How Did It Happen? */}
        {step === 1 && (
          <motion.div
            key="how-it-happened"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-4xl"
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-sm uppercase tracking-[0.6em] text-cyan-400 font-bold"
            >
              [ INCIDENT_ANALYSIS // POST_MORTEM ]
            </motion.p>
            <h1 className="mt-6 text-8xl font-black tracking-tight text-white uppercase">
              How Did It
            </h1>
            <h1 className="text-8xl font-black tracking-tight text-cyan-400 uppercase drop-shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              Happen?
            </h1>
          </motion.div>
        )}

        {/* STEP 2: What Was The Vulnerability? */}
        {step === 2 && (
          <motion.div
            key="vulnerability"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="text-center font-mono max-w-4xl"
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-sm uppercase tracking-[0.6em] text-red-400 font-bold"
            >
              [ VULNERABILITY // IDENTIFIED ]
            </motion.p>
            <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase leading-tight">
              What Was The
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-red-400 uppercase drop-shadow-[0_0_40px_rgba(248,113,113,0.3)]">
              Vulnerability?
            </h1>
          </motion.div>
        )}

        {/* STEP 3: Every Single Day */}
        {step === 3 && (
          <motion.div
            key="hook-1"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="text-center font-mono"
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-sm uppercase tracking-[0.6em] text-cyan-400 font-bold"
            >
              [ CHRONO_TRACK // GLOBAL_FEED ]
            </motion.p>
            <h1 className="mt-6 text-8xl font-black tracking-tight text-white uppercase">
              Every Single Day
            </h1>
          </motion.div>
        )}

        {/* STEP 4: Someone Clicks */}
        {step === 4 && (
          <motion.div
            key="hook-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono"
          >
            <p className="text-sm uppercase tracking-[0.6em] text-slate-500 font-bold">
              Every Single Day
            </p>
            <h1 className="mt-6 text-8xl font-black tracking-tight text-white uppercase">
              Someone Clicks.
            </h1>
          </motion.div>
        )}

        {/* STEP 5: Attack Begins */}
        {step === 5 && (
          <motion.div
            key="attack-begins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono"
          >
            <p className="text-sm uppercase tracking-[0.6em] text-slate-500 font-bold">
              Someone Clicks.
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-6xl font-extrabold text-red-400 flex items-center justify-center gap-3"
            >
              <ShieldAlert size={52} className="animate-pulse" />
              AND AN ATTACK BEGINS.
            </motion.h2>
          </motion.div>
        )}

        {/* STEP 6: Session Title */}
        {step === 6 && (
          <motion.div
            key="title-reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-5xl"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <Shield size={40} />
              </div>
            </div>
            <h1 className="text-7xl font-extrabold tracking-tight text-white uppercase leading-none">
              Online Safety <br />
              <span className="text-slate-500 font-light text-6xl">&</span>{" "}
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Cybersecurity Awareness
              </span>
            </h1>
            <p className="mt-8 font-mono text-xs tracking-widest text-slate-400 uppercase">
              // Training the Trainer Session // Core Briefing
            </p>
          </motion.div>
        )}

        {/* STEP 7: Cyber Definition - Phase 1 */}
        {step === 7 && (
          <motion.div
            key="def-phase-1"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            className="text-center font-mono"
          >
            <span className="text-[10px] tracking-[0.4em] text-cyan-500/50 block mb-4">
              // INITIALIZING CONCEPT
            </span>
            <h1 className="text-9xl font-black tracking-[0.25em] text-cyan-400 select-none drop-shadow-[0_0_60px_rgba(34,211,238,0.3)] pl-[0.25em]">
              CYBER
            </h1>
          </motion.div>
        )}

        {/* STEP 8: Cyber Definition - Phase 2 */}
        {step === 8 && (
          <motion.div
            key="def-phase-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center font-mono flex flex-col md:flex-row items-center gap-6"
          >
            <h1 className="text-7xl font-black tracking-wider text-slate-400 uppercase">
              CYBER
            </h1>
            <span className="text-4xl text-cyan-500 font-light">+</span>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-7xl font-black tracking-wider text-cyan-400 uppercase drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]"
            >
              SECURITY
            </motion.h1>
          </motion.div>
        )}

        {/* STEP 9: Cyber Definition - Phase 3 */}
        {step === 9 && (
          <motion.div
            key="def-phase-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-4xl grid grid-cols-2 gap-16 font-mono relative"
          >
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-800/60 -translate-x-1/2 hidden md:block" />
            <div className="text-right flex flex-col justify-center items-end pr-8">
              <h2 className="text-3xl font-extrabold text-slate-500 tracking-wider">
                CYBER
              </h2>
              <div className="h-6 w-[2px] bg-cyan-500/40 my-3 mr-4" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-white uppercase tracking-tight"
              >
                Digital World
              </motion.p>
            </div>
            <div className="text-left flex flex-col justify-center items-start pl-8">
              <h2 className="text-3xl font-extrabold text-slate-500 tracking-wider">
                SECURITY
              </h2>
              <div className="h-6 w-[2px] bg-blue-500/40 my-3 ml-6" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-4xl font-black text-cyan-400 uppercase tracking-tight drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]"
              >
                Protection
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* STEP 10: Cyber Definition - Phase 4 */}
        {step === 10 && (
          <motion.div
            key="def-phase-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl text-center font-mono"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded border border-slate-800 bg-slate-950/60 px-3 py-1 text-[10px] tracking-widest text-cyan-400 uppercase mb-8">
              <Terminal size={12} />
              <span>CORE_MISSION_OBJECTIVE //</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight uppercase">
              Protecting{" "}
              <span className="text-cyan-400 underline decoration-cyan-500/30 underline-offset-8">
                People
              </span>
              , <br />
              devices, <br />
              <span className="text-slate-400 font-medium">
                and critical information.
              </span>
            </h1>
          </motion.div>
        )}

        {/* STEP 11: Operational Roadmap */}
        {step === 11 && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl text-center"
          >
            <h1 className="mb-14 text-5xl font-extrabold text-white font-mono tracking-tight uppercase">
              Operational Roadmap
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                "Threat Vectors",
                "Phishing Control",
                "Credential Hygiene",
                "Social Engineering",
                "Countermeasures",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-6 font-mono">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-4 shadow-xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      <span className="text-cyan-500 mr-1.5">
                        0{index + 1}.
                      </span>{" "}
                      {item}
                    </p>
                  </div>
                  {index < 4 && (
                    <ArrowRight
                      className="text-cyan-500/40 shrink-0"
                      size={14}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-14 font-mono text-xs tracking-wider text-slate-500 uppercase">
              Interactive Simulation Demos • Live Exercises • Response
              Integration
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
