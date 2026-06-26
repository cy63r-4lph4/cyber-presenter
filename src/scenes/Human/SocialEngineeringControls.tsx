import { RotateCcw, UserCog, MessageSquareWarning, UserCircle, Clock, ShieldAlert } from "lucide-react";
import type { SceneControlsProps } from "../../shared/types/presentation";

export function SocialEngineeringControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  const steps = [
    { value: 0, label: "Title", icon: UserCog, description: "The Human Exploit" },
    { value: 1, label: "Confident Human", icon: MessageSquareWarning, description: "No system hacked faster than..." },
    { value: 2, label: "Impersonation", icon: UserCircle, description: "Borrowed authority tactic" },
    { value: 3, label: "Urgency Pressure", icon: Clock, description: "Panic shuts down judgment" },
    { value: 4, label: "Discomfort Beat", icon: ShieldAlert, description: "It's worked on someone here" },
  ];

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
            SEC-OPS // PRESENTATION CONTROL
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Scene Node: Social Engineering</p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          STEP_{String(sceneStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
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
                  ? "border-red-500/40 bg-red-950/30 shadow-[0_0_15px_rgba(248,113,113,0.05)]"
                  : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={13} className={active ? "text-red-400" : "text-slate-500"} />
                <span className={`text-xs font-bold uppercase ${active ? "text-white" : "text-slate-400"}`}>
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
        Restart Scene
      </button>
    </div>
  );
}