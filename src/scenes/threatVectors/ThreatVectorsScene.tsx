import { AnimatePresence, motion } from "framer-motion";
import {
  DoorOpen,
  Mail,
  Users,
  KeyRound,
  MonitorSmartphone,
  Fingerprint,
  ShieldOff,
  Castle,
  MessageCircleQuestion,
} from "lucide-react";

import type { SceneProps } from "../../shared/types/presentation";

const abstractVectors = [
  { label: "Email", icon: Mail },
  { label: "Human Trust", icon: Users },
  { label: "Password Reuse", icon: KeyRound },
  { label: "Browser / Session Hijack", icon: MonitorSmartphone },
  { label: "Fake Interfaces", icon: Fingerprint },
];

const realms = [
  {
    key: "human",
    title: "Human Layer",
    color: "cyan",
    items: ["Phishing", "Social Manipulation", "Impersonation"],
  },
  {
    key: "credential",
    title: "Credential Layer",
    color: "amber",
    items: ["Weak Passwords", "Reused Passwords", "Credential Stuffing"],
  },
  {
    key: "system",
    title: "System Layer",
    color: "red",
    items: ["Malware", "API Abuse", "Misconfigurations"],
  },
];

const realmColorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/30",
    text: "text-cyan-400",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.12)]",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-950/20",
    text: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.12)]",
  },
  red: {
    border: "border-red-500/30",
    bg: "bg-red-950/20",
    text: "text-red-400",
    glow: "shadow-[0_0_30px_rgba(248,113,113,0.12)]",
  },
};

export function ThreatVectorsScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 8);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Ambient glow, matching IntroScene's atmosphere treatment */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[15%] top-[15%] h-96 w-96 rounded-full bg-cyan-500/5 blur-[160px]" />
        <div className="absolute right-[15%] bottom-[20%] h-96 w-96 rounded-full bg-red-500/5 blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Cold open line */}
        {step === 0 && (
          <motion.div
            key="cold-open"
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
              [ THREAT_MODEL // DEFINITION ]
            </motion.p>
            <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase leading-tight">
              A Threat Vector
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-slate-500 uppercase leading-tight">
              Is Not An Attack.
            </h1>
          </motion.div>
        )}

        {/* STEP 1: Punchline continuation */}
        {step === 1 && (
          <motion.div
            key="punchline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono"
          >
            <p className="text-sm uppercase tracking-[0.6em] text-slate-500 font-bold">
              A Threat Vector Is Not An Attack.
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-7xl font-extrabold text-cyan-400 flex items-center justify-center gap-4 drop-shadow-[0_0_40px_rgba(34,211,238,0.3)]"
            >
              <DoorOpen size={56} />
              It's The Doorway.
            </motion.h2>
          </motion.div>
        )}

        {/* STEP 2: Abstract vector list, fading in one at a time */}
        {step === 2 && (
          <motion.div
            key="vector-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            className="w-full max-w-3xl font-mono"
          >
            <p className="mb-10 text-center text-sm uppercase tracking-[0.5em] text-slate-500 font-bold">
              [ KNOWN_DOORWAYS // SCANNING ]
            </p>
            <div className="space-y-4">
              {abstractVectors.map((vector, index) => {
                const Icon = vector.icon;
                return (
                  <motion.div
                    key={vector.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.35 }}
                    className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-6 py-4"
                  >
                    <Icon size={22} className="text-cyan-400 shrink-0" />
                    <p className="text-2xl font-bold text-white uppercase tracking-tight">
                      {vector.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Transition line into the three realms */}
        {step === 3 && (
          <motion.div
            key="realm-transition"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="text-center font-mono max-w-3xl"
          >
            <p className="text-2xl text-slate-400 leading-relaxed">
              These don't sit in isolation.
            </p>
            <h1 className="mt-4 text-6xl font-black tracking-tight text-white uppercase">
              They Stack Into
            </h1>
            <h1 className="text-6xl font-black tracking-tight text-cyan-400 uppercase drop-shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              Three Realms.
            </h1>
          </motion.div>
        )}

        {/* STEP 4: Realm 1 — Human Layer */}
        {step === 4 && <RealmReveal realm={realms[0]} index={1} total={3} />}

        {/* STEP 5: Realm 2 — Credential Layer */}
        {step === 5 && <RealmReveal realm={realms[1]} index={2} total={3} />}

        {/* STEP 6: Realm 3 — System Layer */}
        {step === 6 && <RealmReveal realm={realms[2]} index={3} total={3} />}

        {/* STEP 7: All three realms stacked — the fortress payoff shot */}
        {step === 7 && (
          <motion.div
            key="fortress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl font-mono"
          >
            <div className="mb-10 flex justify-center">
              <Castle size={40} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              {realms.map((realm, index) => {
                const colors = realmColorMap[realm.color];
                return (
                  <motion.div
                    key={realm.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.25 }}
                    className={`rounded-2xl border ${colors.border} ${colors.bg} ${colors.glow} px-8 py-6`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-2xl font-black uppercase tracking-tight ${colors.text}`}>
                        {realm.title}
                      </p>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        {realm.items.join(" · ")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-10 text-center text-xs uppercase tracking-widest text-slate-500">
              One fortress. Three walls. Any one can fall.
            </p>
          </motion.div>
        )}

        {/* STEP 8: Audience question prompt beat */}
        {step === 8 && (
          <motion.div
            key="audience-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-3xl"
          >
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
                <MessageCircleQuestion size={32} />
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.5em] text-cyan-400 font-bold">
              [ FLOOR_OPEN // YOUR_TURN ]
            </p>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
              Which layer is
            </h1>
            <h1 className="text-5xl font-extrabold tracking-tight text-cyan-400 uppercase leading-tight">
              your weakest wall?
            </h1>
            <p className="mt-8 text-sm text-slate-500 uppercase tracking-widest">
              Trainer: launch this as a live question or quiz from Remote
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Shared layout for the three individual realm-reveal steps (4, 5, 6).
 *  Kept as one sub-component since all three beats share identical
 *  structure and only differ by which realm + index they show. */
function RealmReveal({
  realm,
  index,
  total,
}: {
  realm: (typeof realms)[number];
  index: number;
  total: number;
}) {
  const colors = realmColorMap[realm.color];

  return (
    <motion.div
      key={realm.key}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      className="text-center font-mono max-w-3xl"
    >
      <p className="text-xs uppercase tracking-[0.5em] text-slate-500 font-bold mb-4">
        Realm {index} of {total}
      </p>

      <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border ${colors.border} ${colors.bg} ${colors.glow}`}>
        <ShieldOff size={36} className={colors.text} />
      </div>

      <h1 className={`text-6xl font-black tracking-tight uppercase ${colors.text} drop-shadow-[0_0_40px_rgba(34,211,238,0.15)]`}>
        {realm.title}
      </h1>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {realm.items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="rounded-xl border border-slate-800 bg-slate-950/50 px-6 py-3"
          >
            <p className="text-lg font-bold text-white uppercase tracking-wide">
              {item}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}