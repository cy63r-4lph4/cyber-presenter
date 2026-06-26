import { useState } from "react";
import { socket } from "../socket";

/**
 * Standalone phishing-simulation landing page. Convincing Microsoft-style
 * clone by design — that's the point of the exercise. The critical
 * boundary: the password <input> exists and is fully interactive, but its
 * value is read ONLY to confirm non-empty, then immediately discarded.
 * It is never put in state, never logged, never sent over the socket.
 * Only `passwordEntered: true/false` leaves this component.
 */
export function MicrosoftLoginClone() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"login" | "loading" | "debrief">("login");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const passwordInput = form.elements.namedItem(
      "password",
    ) as HTMLInputElement | null;
    const passwordEntered = Boolean(
      passwordInput?.value && passwordInput.value.length > 0,
    );

    // Clear the field immediately and never read it again — this is the
    // entire enforcement of "we never capture the password."
    if (passwordInput) passwordInput.value = "";

    socket.emit("phish:capture", {
      emailTyped: email.trim(),
      passwordEntered,
    });

    setStage("loading");
    setTimeout(() => setStage("debrief"), 1400);
  }

  if (stage === "debrief") {
    return (
      <main className="min-h-screen bg-[#f3f2f1] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            This was a phishing simulation
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The page you just used was a training exercise, not the real
            Microsoft sign-in. Nothing was stolen — your password field was
            never read or transmitted, only the fact that you typed something
            into it.
          </p>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              What gave it away
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              <li>• The link came from an unexpected sender, by email</li>
              <li>• It pushed urgency ("sign in now or lose access")</li>
              <li>• The domain wasn't a real Microsoft address</li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            If you used your real password anywhere just now, change it as a
            precaution — habit is the actual risk, not this exercise.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f2f1] flex items-center justify-center px-4 font-serif">
      <div className="w-full max-w-sm bg-white p-9 shadow-2xl">
        <div className="flex gap-2">
          <svg width="26" height="26" viewBox="0 0 23 23" className="mb-5">
            <path fill="#f25022" d="M1 1h10v10H1z" />
            <path fill="#7fba00" d="M12 1h10v10H12z" />
            <path fill="#00a4ef" d="M1 12h10v10H1z" />
            <path fill="#ffb900" d="M12 12h10v10H12z" />
          </svg>
          <div className="text-xl text-gray-500 font-bold font-sans">Microsoft</div>
        </div>
        {stage === "login" && (
          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-600">
              to continue to your company account
            </p>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email, phone, or Skype"
              className="mt-6 w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />

            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              className="mt-6 w-full rounded bg-blue-900 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        )}

        {stage === "loading" && (
          <div className="py-10 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Signing in…</p>
          </div>
        )}
      </div>
    </main>
  );
}
