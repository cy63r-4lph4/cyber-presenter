import {
  RotateCcw,
  ShieldCheck,
  HeartHandshake,
  KeyRound,
  Megaphone,
  Radar,
  Sparkles,
} from "lucide-react";
import type { SceneControlsProps } from "../../shared/types/presentation";

export function IncidentResponseControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  const steps = [
    {
      value: 0,
      label: "Title",
      icon: ShieldCheck,
      description: "If You Fall For It — tone shift opens here",
    },
    {
      value: 1,
      label: "The Reframe",
      icon: HeartHandshake,
      description: "Falling for it isn't the failure. Hiding it is.",
    },
    {
      value: 2,
      label: "Step 1: Don't Panic",
      icon: ShieldCheck,
      description: "Don't quietly try to fix it alone",
    },
    {
      value: 3,
      label: "Step 2: Change Password",
      icon: KeyRound,
      description: "Immediately, everywhere it was reused",
    },
    {
      value: 4,
      label: "Step 3: Report Now",
      icon: Megaphone,
      description: "Speed limits damage, not certainty",
    },
    {
      value: 5,
      label: "Step 4: Watch Follow-Up",
      icon: Radar,
      description: "MFA prompts, login alerts, reset emails",
    },
    {
      value: 6,
      label: "Closing Line",
      icon: Sparkles,
      description: "Speed beats shame — ties back to every realm",
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            SEC-OPS // PRESENTATION CONTROL
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Scene Node: Incident Response
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          STEP_{String(sceneStep + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = sceneStep === step.value;

          return (
            <button
              key={step.value}
              onClick={() => setSceneStep(step.value)}
              className={`rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
                active
                  ? "border-emerald-500/40 bg-emerald-950/30 shadow-[0_0_15px_rgba(52,211,153,0.05)]"
                  : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={13}
                  className={active ? "text-emerald-400" : "text-slate-500"}
                />
                <span
                  className={`text-xs font-bold tracking-wide uppercase ${active ? "text-white" : "text-slate-400"}`}
                >
                  {step.label}
                </span>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500 line-clamp-2 normal-case">
                {step.description}
              </p>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setSceneStep(0)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-900 bg-slate-950/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-950 hover:text-slate-200 transition-colors active:scale-[0.99]"
      >
        <RotateCcw size={12} />
        Restart Incident Response
      </button>
    </div>
  );
}