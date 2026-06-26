import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  HeartHandshake,
  KeyRound,
  Megaphone,
  Radar,
  Sparkles,
} from "lucide-react";
import type { SceneProps } from "../../shared/types/presentation";

export function IncidentResponseScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 6);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Calmer ambient glow than the attack scenes — emerald/cyan instead of red/amber */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-[20%] h-96 w-96 rounded-full bg-emerald-500/5 blur-[160px]" />
        <div className="absolute right-[20%] bottom-[25%] h-96 w-96 rounded-full bg-cyan-500/5 blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Tone-shift title */}
        {step === 0 && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center font-mono max-w-4xl"
          >
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-400 font-bold">
              [ INCIDENT_RESPONSE // IF_IT_HAPPENS ]
            </p>
            <h1 className="mt-6 text-7xl font-black tracking-tight text-white uppercase leading-tight">
              If You Fall
            </h1>
            <h1 className="text-7xl font-black tracking-tight text-emerald-400 uppercase leading-tight drop-shadow-[0_0_40px_rgba(52,211,153,0.3)]">
              For It
            </h1>
          </motion.div>
        )}

        {/* STEP 1: The reframe — this is the emotional hinge of the whole scene */}
        {step === 1 && (
          <motion.div
            key="reframe"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <HeartHandshake size={48} className="mx-auto mb-8 text-emerald-400" />
            <p className="text-3xl text-slate-300 leading-relaxed">
              Falling for it
            </p>
            <p className="mt-2 text-5xl font-black text-white uppercase">
              isn't the failure.
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-5xl font-black text-red-400 uppercase drop-shadow-[0_0_30px_rgba(248,113,113,0.2)]"
            >
              Hiding it is.
            </motion.p>
          </motion.div>
        )}

        {/* STEP 2: Don't panic, don't go it alone */}
        {step === 2 && (
          <ResponseStep
            index={1}
            total={4}
            icon={ShieldCheck}
            title="Don't Panic"
            body="Don't try to quietly fix it yourself. One calm, early step beats an hour of silent guessing."
          />
        )}

        {/* STEP 3: Change the password, everywhere it was reused */}
        {step === 3 && (
          <ResponseStep
            index={2}
            total={4}
            icon={KeyRound}
            title="Change The Password"
            body="Immediately — and everywhere that same password lives. Remember the reuse chain. One change should become several."
          />
        )}

        {/* STEP 4: Report it now, not after self-diagnosing severity */}
        {step === 4 && (
          <ResponseStep
            index={3}
            total={4}
            icon={Megaphone}
            title="Report It Now"
            body="Not after you've tried to figure out how bad it is. Speed is what limits the damage — not certainty."
          />
        )}

        {/* STEP 5: Watch for follow-up activity */}
        {step === 5 && (
          <ResponseStep
            index={4}
            total={4}
            icon={Radar}
            title="Watch For Follow-Up"
            body="Unexpected MFA prompts, login alerts, password-reset emails you didn't request. Those are the second wave."
          />
        )}

        {/* STEP 6: Closing line, ties back to every realm shown earlier */}
        {step === 6 && (
          <motion.div
            key="closing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono max-w-3xl"
          >
            <div className="mb-8 flex justify-center">
              <Sparkles size={40} className="text-emerald-400" />
            </div>
            <p className="text-sm uppercase tracking-[0.5em] text-emerald-400 font-bold mb-6">
              [ THE_ONE_RULE // EVERY_LAYER ]
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
              Every realm we showed you today
            </h1>
            <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-emerald-400 uppercase leading-tight drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]">
              has the same fix.
            </h1>
            <p className="mt-10 text-3xl font-bold text-white">
              Speed beats shame.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Shared layout for the four numbered response steps (2–5). Each gets the
 *  same calm, single-focus treatment — one action, one icon, one sentence
 *  of context — deliberately less busy than the attack scenes that came
 *  before it, since the room needs this to feel simple and memorable. */
function ResponseStep({
  index,
  total,
  icon: Icon,
  title,
  body,
}: {
  index: number;
  total: number;
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      className="text-center font-mono max-w-3xl"
    >
      <p className="text-xs uppercase tracking-[0.5em] text-slate-500 font-bold mb-6">
        Step {index} of {total}
      </p>

      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950/30 shadow-[0_0_30px_rgba(52,211,153,0.12)]">
        <Icon size={36} className="text-emerald-400" />
      </div>

      <h1 className="text-6xl font-black tracking-tight uppercase text-white">
        {title}
      </h1>

      <p className="mt-8 text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
        {body}
      </p>
    </motion.div>
  );
}