import { Eye, RefreshCcw, RotateCcw } from "lucide-react";
import { socket } from "../../socket";
import type { SceneControlsProps } from "../../shared/types/presentation";

export function PhishingLiveControls({ sceneStep, setSceneStep }: SceneControlsProps) {
  function resetCaptures() {
    socket.emit("phish:reset");
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
            SEC-OPS // LIVE CAPTURE FEED
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Scene Node: Phishing Demo
          </p>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-400">
          {sceneStep === 0 ? "LIVE" : "DEBRIEF"}
        </div>
      </div>

      <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3">
        <p className="text-[10px] leading-relaxed text-slate-400 normal-case">
          Send the prepared email now if you haven't. Captures appear on the
          big screen automatically as people click and submit — no action
          needed from you until you're ready to debrief.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSceneStep(0)}
          className={`rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
            sceneStep === 0
              ? "border-red-500/40 bg-red-950/30"
              : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Eye size={13} className={sceneStep === 0 ? "text-red-400" : "text-slate-500"} />
            <span className={`text-xs font-bold uppercase ${sceneStep === 0 ? "text-white" : "text-slate-400"}`}>
              Live Feed
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 normal-case">
            Show incoming captures as they happen
          </p>
        </button>

        <button
          onClick={() => setSceneStep(1)}
          className={`rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
            sceneStep === 1
              ? "border-red-500/40 bg-red-950/30"
              : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCcw size={13} className={sceneStep === 1 ? "text-red-400" : "text-slate-500"} />
            <span className={`text-xs font-bold uppercase ${sceneStep === 1 ? "text-white" : "text-slate-400"}`}>
              Debrief
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 normal-case">
            Reveal the "you just got phished" beat
          </p>
        </button>
      </div>

      <button
        onClick={resetCaptures}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-900 bg-slate-950/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-950 hover:text-slate-200 transition-colors active:scale-[0.99]"
      >
        <RotateCcw size={12} />
        Clear Captures (new session)
      </button>
    </div>
  );
}