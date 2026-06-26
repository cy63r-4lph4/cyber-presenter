import { Lock, Mail, RotateCcw, ShieldAlert } from "lucide-react";
import type { SceneControlsProps } from "../../shared/types/presentation";

/**
 * Bespoke Remote controls for FakeLoginScene. Renders instead of the
 * generic Reveal button when this scene is active (see Remote.tsx).
 *
 * Each button sets sceneStep directly to the value FakeLoginScene expects
 * for that moment — the labels are specific to this scene's story beats,
 * per your call that bespoke scenes should get real button labels rather
 * than generic "Step Forward/Back".
 */
export function FakeLoginControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  const steps = [
    { value: 0, label: "Show Email", icon: Mail },
    { value: 1, label: "Show Fake Page", icon: Lock },
    { value: 2, label: "Mark Captured", icon: ShieldAlert },
    { value: 3, label: "Reveal Lesson", icon: Lock },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Fake Login Trap · Step {sceneStep + 1} of {steps.length}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = sceneStep === step.value;

          return (
            <button
              key={step.value}
              onClick={() => setSceneStep(step.value)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition active:scale-95 ${
                isActive
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                  : "border-white/[0.06] bg-white/[0.03] text-slate-300"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {step.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setSceneStep(0)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-slate-500 active:scale-95"
      >
        <RotateCcw size={11} />
        Restart this scene
      </button>
    </div>
  );
}