import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquareText, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  Activity 
} from "lucide-react";
import type { AudienceAnswer, LiveQuestion } from "../../shared/types/presentation";

const categoryConfig = {
  strong: {
    label: "COMPLIANT METRICS // STRONG",
    borderColor: "border-emerald-500/20",
    hoverBorder: "group-hover:border-emerald-500/40",
    badgeColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
    textColor: "text-emerald-300",
    icon: ShieldCheck,
  },
  discussion: {
    label: "VARIABLE MATRIX // DISCUSSION STARTER",
    borderColor: "border-amber-500/20",
    hoverBorder: "group-hover:border-amber-500/40",
    badgeColor: "text-amber-400 bg-amber-950/40 border-amber-500/20",
    textColor: "text-amber-300",
    icon: HelpCircle,
  },
  risky: {
    label: "THREAT VECTOR // HIGH RISK RISK",
    borderColor: "border-rose-500/20",
    hoverBorder: "group-hover:border-rose-500/40",
    badgeColor: "text-rose-400 bg-rose-950/40 border-rose-500/20",
    textColor: "text-rose-300",
    icon: AlertTriangle,
  },
  uncategorized: {
    label: "INBOUND INGEST // LIVE RESPONSES",
    borderColor: "border-slate-800",
    hoverBorder: "group-hover:border-cyan-500/30",
    badgeColor: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20",
    textColor: "text-cyan-300",
    icon: Activity,
  },
};

type AudienceWallProps = {
  question: LiveQuestion | null;
  answers: AudienceAnswer[];
};

export function AudienceWall({ question, answers }: AudienceWallProps) {
  const visibleAnswers = answers.filter((answer) => answer.visible);

  const groupedAnswers = useMemo(() => {
    return {
      strong: visibleAnswers.filter((answer) => answer.category === "strong"),
      discussion: visibleAnswers.filter((answer) => answer.category === "discussion"),
      risky: visibleAnswers.filter((answer) => answer.category === "risky"),
      uncategorized: visibleAnswers.filter((answer) => !answer.category),
    };
  }, [visibleAnswers]);

  return (
    <motion.section
      key="audience-wall"
      initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="grid flex-1 grid-cols-[0.85fr_1.15fr] items-center gap-14 font-mono h-full"
    >
      {/* LEFT: Context Panel & Counter Hub */}
      <div className="space-y-6 text-left">
        <div className="inline-flex items-center gap-2 rounded border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[10px] tracking-widest text-cyan-400 uppercase">
          <MessageSquareText size={12} className="animate-pulse" />
          <span>ROOM_FEED // INTERACTIVE OVERLAY</span>
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white uppercase leading-[1.1]">
          {question?.prompt ?? "Awaiting Active Prompt Payload"}
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-slate-400 normal-case">
          Live capture arrays parse audience telemetry inputs dynamically. Reviewing secure countermeasures, behavioral variables, and high-exposure threat profiles directly from the room floor.
        </p>

        {/* Tactical Metric Dashboard Sliders */}
        <div className="pt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-emerald-950/60 bg-emerald-950/10 p-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 text-[9px] text-emerald-500/40">SEC</div>
            <p className="text-3xl font-extrabold tracking-tight text-emerald-400">{groupedAnswers.strong.length}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Strong</p>
          </div>

          <div className="rounded-lg border border-amber-950/60 bg-amber-950/10 p-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 text-[9px] text-amber-500/40">VAR</div>
            <p className="text-3xl font-extrabold tracking-tight text-amber-400">{groupedAnswers.discussion.length}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Discuss</p>
          </div>

          <div className="rounded-lg border border-rose-950/60 bg-rose-950/10 p-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 text-[9px] text-rose-500/40">EXP</div>
            <p className="text-3xl font-extrabold tracking-tight text-rose-400">{groupedAnswers.risky.length}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Risky</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Feed Stream Cards Grid */}
      <div className="grid max-h-[75vh] grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {(["strong", "discussion", "risky", "uncategorized"] as const).map((category) => {
            const items = groupedAnswers[category];
            if (items.length === 0) return null;
            const config = categoryConfig[category];

            return (
              <div
                key={category}
                className={`group rounded-xl border bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-300 ${config.borderColor} ${config.hoverBorder}`}
              >
                {/* Section Sub-Header */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-[9px] font-bold tracking-wider text-slate-500">
                    {config.label}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-700 group-hover:bg-cyan-500 transition-colors" />
                </div>

                {/* Sub-Items Feed Pipeline */}
                <div className="space-y-3">
                  {items.slice(0, 3).map((item) => {
                    const CardIcon = config.icon;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-lg border border-slate-900 bg-[#030712] p-3.5 relative overflow-hidden"
                      >
                        {/* Meta Anchor Bar */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`rounded p-0.5 border text-xs ${config.badgeColor}`}>
                              <CardIcon size={12} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[120px]">
                              {item.participantName || "ANON_NODE"}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-slate-600">ID_{item.id.slice(0, 4)}</span>
                        </div>

                        {/* Actual User Text Content */}
                        <p className="text-xs text-slate-300 leading-relaxed normal-case pl-0.5">
                          "{item.answer}"
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}