import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  Terminal,
  Users,
  Fingerprint,
  HelpCircle,
} from "lucide-react";

import type { SceneProps } from "../../shared/types/presentation";

export function SecurityAlertScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 5);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 0: Initial Inbound Breach Image */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            className="w-full max-w-3xl"
          >
            <AlertMockup title="INCIDENT_DETECTION // GOOGLE_AUTH" image="/images/google_sec_alert.jpg" isCritical />
          </motion.div>
        )}

        {/* STEP 1: Escalated Single Threat Graphic */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl"
          >
            <AlertMockup title="THREAT_VECTOR_LOG // UNRECOGNIZED_DEVICE" image="/images/google_sec_alert.png" isCritical />
          </motion.div>
        )}

        {/* STEP 2: The Grid Cascade (Multiple Platforms Hit) */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid w-full max-w-5xl grid-cols-2 gap-6"
          >
            <AlertMockup title="SUBSYSTEM_01 // GOOGLE_ALERT" image="/images/google_sec_alert.png" />
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertMockup title="SUBSYSTEM_02 // MICROSOFT_ALERT" image="/images/microsoft_sec_alert.jpg" isCritical />
            </motion.div>
          </motion.div>
        )}

        {/* STEP 3: Dramatic System Reflection Quote */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center font-mono"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
              <AlertTriangle size={32} />
            </div>
            <h2 className="mt-8 text-xs font-bold uppercase tracking-[0.6em] text-red-500/70">
              CRITICAL PRIVILEGE ESCALATION
            </h2>
            <h1 className="mt-4 text-7xl font-extrabold tracking-tight text-white uppercase">
              If It Wasn't You...
            </h1>
            <h1 className="mt-2 text-7xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent uppercase drop-shadow-sm">
              Who Was It?
            </h1>
          </motion.div>
        )}

        {/* STEP 4: Tactical Audience Hook */}
        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl text-center font-mono"
          >
            <div className="mx-auto inline-flex items-center gap-2 rounded border border-slate-800 bg-slate-950/60 px-3 py-1 text-[11px] tracking-widest text-slate-400 uppercase">
              <Fingerprint size={12} className="text-cyan-400" />
              <span>Incident Response Simulation</span>
            </div>
            <h1 className="mt-6 text-6xl font-black tracking-tight text-white leading-tight">
              What Would Be Your <br />
              <span className="text-cyan-400">First Core Action?</span>
            </h1>
            <div className="mt-8 flex justify-center gap-8 text-sm font-semibold text-slate-500 tracking-wider">
              <p className="animate-pulse">// HOLD INTENTIONS</p>
              <p className="opacity-60">// ANALYZE COGNITIVELY</p>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Interactive Terminal Portal Engagement */}
        {step === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            {/* HUD Status Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  <Users size={16} />
                </div>
                <div className="text-left font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Live Vote Initialization</h3>
                  <p className="text-[10px] text-slate-500">BROADCAST_READY // awaiting_user_payloads</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Main Command Directive Box */}
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-950/40 to-slate-950/80 p-8 text-center backdrop-blur-md">
              <div className="absolute top-0 right-0 p-3 font-mono text-[9px] tracking-widest text-slate-700 select-none">
                SIM_ID_8829
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                What Would You Do First?
              </h1>
              
              <p className="mt-3 font-mono text-xs tracking-wider text-slate-400">
                [ ACCESS TERMINAL PORTAL VIA YOUR MOBILE DEVICE TO SUBMIT RESPONSES ]
              </p>

              {/* Scenario Inner Core Terminal Panel */}
              <div className="mt-8 rounded-lg border border-slate-900 bg-[#030712] p-6 text-left font-mono relative">
                <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#030712] px-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Scenario Parameter
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  System logs trace a successful, unauthorized authentication node verification originating from an external network cluster across global boundaries.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-900 flex items-start gap-3">
                  <HelpCircle size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-md font-bold text-slate-200">
                    What is your immediate tactical countermeasure?
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* --- REFACTORED SEC-OPS MOCKUP CARD --- */
function AlertMockup({
  title,
  image,
  isCritical = false,
}: {
  title: string;
  image: string;
  isCritical?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 bg-slate-950/40 p-3 shadow-2xl backdrop-blur-md ${
      isCritical ? "border-red-950/60 hover:border-red-500/30" : "border-slate-800/80 hover:border-cyan-500/30"
    }`}>
      {/* Structural Corner Accent Notches */}
      <div className={`absolute top-0 left-0 h-1.5 w-1.5 border-t-2 border-l-2 ${isCritical ? "border-red-500/40" : "border-slate-700"}`} />
      <div className={`absolute top-0 right-0 h-1.5 w-1.5 border-t-2 border-r-2 ${isCritical ? "border-red-500/40" : "border-slate-700"}`} />

      {/* Terminal Metadata Strip */}
      <div className="mb-2.5 flex items-center justify-between border-b border-slate-900/80 pb-2 px-1 font-mono text-[9px] tracking-widest">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Terminal size={10} className={isCritical ? "text-red-500/60" : "text-cyan-500/60"} />
          <span>{title}</span>
        </div>
        <span className={isCritical ? "text-red-400 animate-pulse" : "text-slate-600"}>
          {isCritical ? "[SYSTEM_WARNING]" : "[CAPTURE_FEED]"}
        </span>
      </div>

      {/* Grid Canvas Canvas Frame */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border border-slate-900 bg-[#040817] bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.015]"
        />
      </div>

      {/* System Status Label */}
      <div className="mt-3 flex items-center gap-2 rounded border border-slate-900 bg-slate-950/80 px-3 py-2">
        <ShieldAlert size={13} className={isCritical ? "text-red-400" : "text-cyan-400"} />
        <div className="flex-1 font-mono text-[10px] font-bold tracking-wider text-slate-300 uppercase truncate">
          Active Incident Payload Source // Inspect Required
        </div>
      </div>
    </div>
  );
}