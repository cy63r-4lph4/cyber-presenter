import {
  AlertTriangle,
  Globe,
  Shield,
  MessageSquareText,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

import type { SceneControlsProps } from "../../shared/types/presentation";

export function SecurityAlertControls({
  sceneStep,
  setSceneStep,
}: SceneControlsProps) {
  const steps = [
    {
      value: 0,
      label: "Security Alert",
      icon: AlertTriangle,
      description: "Open with the warning screen",
    },

    {
      value: 1,
      label: "Google Example",
      icon: Shield,
      description: "Show realistic account alert",
    },

    {
      value: 2,
      label: "More Examples",
      icon: Globe,
      description: "Google, Microsoft & Bank alerts",
    },

    {
      value: 3,
      label: "Reflection",
      icon: HelpCircle,
      description: "If it wasn't you...",
    },

    {
      value: 4,
      label: "First Action",
      icon: AlertTriangle,
      description: "What would you do first?",
    },

    {
      value: 5,
      label: "Audience Question",
      icon: MessageSquareText,
      description: "Prompt audience interaction",
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
          Opening Scene
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Step {sceneStep + 1} of {steps.length}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = sceneStep === step.value;

          return (
            <button
              key={step.value}
              onClick={() => setSceneStep(step.value)}
              className={`rounded-2xl border p-3 text-left transition-all active:scale-95 ${
                active
                  ? "border-cyan-400/30 bg-cyan-400/10"
                  : "border-white/[0.06] bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={16}
                  className={
                    active
                      ? "text-cyan-300"
                      : "text-slate-400"
                  }
                />

                <p
                  className={`text-xs font-bold ${
                    active
                      ? "text-cyan-100"
                      : "text-slate-200"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                {step.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
          Speaker Cue
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-300">
          {sceneStep === 0 &&
            "Pause. Let the room read the screen before speaking."}

          {sceneStep === 1 &&
            "Ask: 'Has anyone seen something like this before?'"}

          {sceneStep === 2 &&
            "Ask: 'Or maybe something similar from Microsoft or your bank?'"}

          {sceneStep === 3 &&
            "Pause after asking: 'If it wasn't you, who was it?'"}

          {sceneStep === 4 &&
            "Ask the room to think before answering."}

          {sceneStep === 5 &&
            "Launch the audience question from the Audience tab."}
        </p>
      </div>

      <button
        onClick={() => setSceneStep(0)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-300 transition active:scale-95"
      >
        <RotateCcw size={14} />
        Restart Opening Scene
      </button>
    </div>
  );
}