import {
  RotateCcw,
  DoorOpen,
  Radar,
  Layers3,
  Users,
  KeyRound,
  ServerCog,
  Castle,
  MessageCircleQuestion,
} from "lucide-react";

import type { SceneControlsProps } from "../../shared/types/presentation";

export function ThreatVectorsControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  const steps = [
    {
      value: 0,
      label: "Cold Open",
      icon: DoorOpen,
      description: "A threat vector is not an attack — setup line",
    },
    {
      value: 1,
      label: "Punchline",
      icon: DoorOpen,
      description: "It's the doorway the attack walks through",
    },
    {
      value: 2,
      label: "Doorways List",
      icon: Radar,
      description: "Abstract vector list fades in one at a time",
    },
    {
      value: 3,
      label: "Realm Transition",
      icon: Layers3,
      description: "They stack into three realms — bridge line",
    },
    {
      value: 4,
      label: "Realm 1: Human",
      icon: Users,
      description: "Phishing, social manipulation, impersonation",
    },
    {
      value: 5,
      label: "Realm 2: Credential",
      icon: KeyRound,
      description: "Weak/reused passwords, credential stuffing",
    },
    {
      value: 6,
      label: "Realm 3: System",
      icon: ServerCog,
      description: "Malware, API abuse, misconfigurations",
    },
    {
      value: 7,
      label: "Fortress",
      icon: Castle,
      description: "All three realms stacked — payoff shot",
    },
    {
      value: 8,
      label: "Audience Prompt",
      icon: MessageCircleQuestion,
      description: "Cue: launch 'weakest wall' question from Remote",
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            SEC-OPS // PRESENTATION CONTROL
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Scene Node: Threat Vectors
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          STEP_{String(sceneStep + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </div>
      </div>

      {/* Audience-prompt reminder strip, mirrors IntroControls' step-0 video HUD pattern */}
      {sceneStep === 8 && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 flex flex-col gap-1.5">
          <p className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
            // Floor Open — Launch Live Question
          </p>
          <p className="text-[10px] leading-relaxed text-slate-400 normal-case">
            Ask: "Which layer is your weakest wall?" — use the Audience tab
            on Remote to launch a question or quiz.
          </p>
        </div>
      )}

      {/* Matrix Controls Grid */}
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
                  ? "border-cyan-500/40 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                  : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={13}
                  className={active ? "text-cyan-400" : "text-slate-500"}
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
        Restart Threat Vectors
      </button>
    </div>
  );
}