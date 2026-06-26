import {
  Shield,
  RotateCcw,
  MousePointerClick,
  Terminal,
  Activity,
  GitCommit,
  Layers,
  Map,
  HelpCircle,
  ShieldAlert,
  Play,
  Pause,
  Square,
} from "lucide-react";

import type { SceneControlsProps } from "../../shared/types/presentation";
import { socket } from "../../socket";

export function IntroControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  const steps = [
    {
      value: 0,
      label: "Video",
      icon: Activity,
      description: "Intro video playback — socket-controlled",
    },
    {
      value: 1,
      label: "How Did It Happen?",
      icon: HelpCircle,
      description: "Post-mortem hook slide",
    },
    {
      value: 2,
      label: "Vulnerability",
      icon: ShieldAlert,
      description: "What was the attack vector?",
    },
    {
      value: 3,
      label: "Every Single Day",
      icon: MousePointerClick,
      description: "Narrative prompt opening",
    },
    {
      value: 4,
      label: "Someone Clicks",
      icon: MousePointerClick,
      description: "Escalation beat — the click",
    },
    {
      value: 5,
      label: "Attack Begins",
      icon: Activity,
      description: "Red warning — attack consequence",
    },
    {
      value: 6,
      label: "Session Title",
      icon: Shield,
      description: "Main presentation title layout",
    },
    {
      value: 7,
      label: "Def: CYBER",
      icon: Terminal,
      description: "Phase 1: Isolated high-glow 'CYBER'",
    },
    {
      value: 8,
      label: "Def: CYBER + SEC",
      icon: GitCommit,
      description: "Phase 2: Combined word formulas",
    },
    {
      value: 9,
      label: "Def: Split Nodes",
      icon: Layers,
      description: "Phase 3: Digital World & Protection breakdown",
    },
    {
      value: 10,
      label: "Core Definition",
      icon: Shield,
      description: "Phase 4: People, devices, information action text",
    },
    {
      value: 11,
      label: "Roadmap Matrix",
      icon: Map,
      description: "Today's journey outline list",
    },
  ];

  // Emits payload data down down to screen component socket listeners
  const sendVideoCommand = (command: "play" | "pause" | "restart") => {
    socket.emit("scene:video", { scene: "intro", command });
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            SEC-OPS // PRESENTATION CONTROL
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Scene Node: Introduction
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          STEP_{String(sceneStep + 1).padStart(2, "0")} /{" "}
          {String(steps.length).padStart(2, "0")}
        </div>
      </div>

      {/* ACTIVE VIDEO HUD HARDWARE STRIP (Only renders on step 0) */}
      {sceneStep === 0 && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 flex flex-col gap-2">
          <p className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase animate-pulse">
            // Active Media Broadcast Controls
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => sendVideoCommand("play")}
              className="flex items-center justify-center gap-1.5 rounded bg-slate-900 border border-slate-800 py-1.5 text-xs text-emerald-400 hover:bg-slate-800 active:scale-95"
            >
              <Play size={10} fill="currentColor" /> Play
            </button>
            <button
              onClick={() => sendVideoCommand("pause")}
              className="flex items-center justify-center gap-1.5 rounded bg-slate-900 border border-slate-800 py-1.5 text-xs text-amber-400 hover:bg-slate-800 active:scale-95"
            >
              <Pause size={10} fill="currentColor" /> Pause
            </button>
            <button
              onClick={() => sendVideoCommand("restart")}
              className="flex items-center justify-center gap-1.5 rounded bg-slate-900 border border-slate-800 py-1.5 text-xs text-cyan-400 hover:bg-slate-800 active:scale-95"
            >
              <Square size={9} fill="currentColor" /> Reset
            </button>
          </div>
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
        onClick={() => {
          setSceneStep(0);
          sendVideoCommand("restart");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-900 bg-slate-950/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-950 hover:text-slate-200 transition-colors active:scale-[0.99]"
      >
        <RotateCcw size={12} />
        Restart Intro Feed
      </button>
    </div>
  );
}
