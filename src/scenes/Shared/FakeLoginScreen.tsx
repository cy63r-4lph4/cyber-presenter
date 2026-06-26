import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Lock, Mail, ShieldAlert } from "lucide-react";
import type { SceneProps } from "../../shared/types/presentation";

/**
 * Step meanings, owned entirely by this scene:
 *   0 — the phishing email that started it
 *   1 — the fake login page the link leads to
 *   2 — "credentials captured" moment
 *   3 — the lesson / debrief
 *
 * Remote drives this via FakeLoginControls, which calls setSceneStep with
 * these same numbers — the scene and its controls agree on the meaning of
 * the step index, nothing else in the app needs to know what they mean.
 */
export function FakeLoginScene({ sceneStep }: SceneProps) {
  const step = Math.min(Math.max(sceneStep, 0), 3);

  return (
    <div className="flex flex-1 items-center justify-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-10"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/15 text-amber-200">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  Inbox · 1 unread
                </p>
                <p className="text-sm text-slate-400">it-support@company-helpdesk.com</p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-white">
              Your password expires today
            </h2>
            <p className="mt-4 text-lg leading-7 text-slate-300">
              We've detected unusual activity on your account. Click below to
              verify your identity and keep access to your files.
            </p>

            <div className="mt-6 inline-block rounded-xl bg-cyan-300 px-6 py-3 font-black text-slate-950">
              Verify My Account →
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="fake-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 text-slate-900"
          >
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
              company-secure-login.co
            </p>
            <h2 className="mt-4 text-center text-2xl font-bold">
              Sign in to continue
            </h2>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-slate-300 px-4 py-3 text-slate-400">
                you@company.com
              </div>
              <div className="rounded-lg border border-slate-300 px-4 py-3 text-slate-400">
                ••••••••
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-slate-900 py-3 text-center font-bold text-white">
              Sign In
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="captured"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center text-center"
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-red-500/15 text-red-400">
              <ShieldAlert size={48} />
            </div>
            <h2 className="mt-8 text-5xl font-black text-red-300">
              Credentials Captured
            </h2>
            <p className="mt-4 max-w-xl text-xl text-slate-300">
              That's it. One click, one form, and the attacker now has a live
              username and password.
            </p>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.06] p-10"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
                <Lock size={22} />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-200">
                What gave it away
              </p>
            </div>

            <ul className="space-y-3 text-xl text-slate-200">
              <li className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-1 shrink-0 text-amber-300" />
                The domain wasn't your real company login URL.
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-1 shrink-0 text-amber-300" />
                Urgency ("today") is a pressure tactic, not a real deadline.
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle size={20} className="mt-1 shrink-0 text-amber-300" />
                IT will never ask you to "verify" via an email link.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}