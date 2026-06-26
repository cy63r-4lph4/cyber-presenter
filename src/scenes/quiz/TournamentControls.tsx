import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Play,
  SkipForward,
  RotateCcw,
  ChevronRight,
  Swords,
  Crown,
  Users,
  CheckCircle2,
  Timer,
  Hash,
  AlertCircle,
} from "lucide-react";
import { socket } from "../../socket";
import type {
  TournamentState,
  TournamentMatch,
} from "../../shared/types/Tournament";
import { TOURNAMENT_INITIAL_STATE } from "../../shared/types/Tournament";
import { QUESTION_BANK } from "../../data/questionBank";

const QUESTIONS_PER_MATCH = 3;
const DEFAULT_TIME_LIMIT = 20;

function vibrate() {
  if ("vibrate" in navigator) navigator.vibrate(14);
}

function dicebearUrl(name: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&radius=50`;
}

function getRoundLabel(roundIndex: number, totalRounds: number) {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Semi-Final";
  if (remaining === 3) return "Quarter-Final";
  return `Round ${roundIndex + 1}`;
}

function MatchScoreboard({ match }: { match: TournamentMatch }) {
  const aScore = match.scores[match.playerA.id] ?? 0;
  const bScore = match.scores[match.playerB.id] ?? 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/30 p-3">
      <div className="flex flex-col items-center gap-1 flex-1">
        <img
          src={dicebearUrl(match.playerA.name)}
          alt=""
          className="h-8 w-8 rounded-full"
        />
        <p className="text-[10px] font-black text-slate-300 truncate max-w-[60px] text-center">
          {match.playerA.name}
        </p>
        <p className="text-base font-black text-amber-300">{aScore}</p>
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Swords size={14} className="text-slate-500" />
        <p className="text-[9px] text-slate-600 font-black uppercase">vs</p>
        <p className="text-[9px] text-slate-600">
          Q {match.questionsCompleted}/{QUESTIONS_PER_MATCH}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1 flex-1">
        <img
          src={dicebearUrl(match.playerB.name)}
          alt=""
          className="h-8 w-8 rounded-full"
        />
        <p className="text-[10px] font-black text-slate-300 truncate max-w-[60px] text-center">
          {match.playerB.name}
        </p>
        <p className="text-base font-black text-amber-300">{bScore}</p>
      </div>
    </div>
  );
}

function TimeLimitSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Timer size={11} className="shrink-0 text-slate-500" />
      <span className="text-[10px] text-slate-500 w-12 shrink-0">
        {value}s / Q
      </span>
      <input
        type="range"
        min={10}
        max={60}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
    </div>
  );
}

export function TournamentControls() {
  const [state, setState] = useState<TournamentState>(TOURNAMENT_INITIAL_STATE);

  const [joinedParticipants, setJoinedParticipants] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT);

  // Replace the existing useEffect that listens to tournament:state
  useEffect(() => {
    socket.on("tournament:state", (incoming: TournamentState) => {
      setState(incoming);

      if (
        incoming.currentMatchId &&
        ["match-active", "question-result", "match-result"].includes(
          incoming.phase,
        )
      ) {
        setSelectedMatchId(incoming.currentMatchId);
      }

      // ← ADD THIS: auto-select when only one pending match exists
      if (
        ["bracket-reveal", "bracket-update"].includes(incoming.phase) &&
        incoming.bracket
      ) {
        const lastRound =
          incoming.bracket.rounds[incoming.bracket.rounds.length - 1];
        const pending = lastRound.filter((m) => !m.winnerId);
        if (pending.length === 1) {
          setSelectedMatchId(pending[0].id);
        }
      }
    });

    socket.on("participants:update", setJoinedParticipants);
    socket.emit("participants:request");

    return () => {
      socket.off("tournament:state");
      socket.off("participants:update", setJoinedParticipants);
    };
  }, []);

  const { phase, bracket } = state;
  const currentRound = bracket?.rounds[bracket.rounds.length - 1] ?? [];
  const pendingMatches = currentRound.filter((m) => !m.winnerId);

  const liveMatch: TournamentMatch | null = useMemo(() => {
    if (!bracket || !state.currentMatchId) return null;
    for (const round of bracket.rounds) {
      const m = round.find((r) => r.id === state.currentMatchId);
      if (m) return m;
    }
    return null;
  }, [bracket, state.currentMatchId]);

  const champion = state.participants.find((p) => p.id === state.championId);
  const roundIndex = bracket ? bracket.rounds.length - 1 : 0;
  const totalRounds = bracket?.totalRounds ?? 1;
  const roundLabel = getRoundLabel(roundIndex, totalRounds);
  const answeredCount = state.matchAnswers.length;
  const bothAnswered = answeredCount >= 2;

  const nextQuestionPreview = useMemo(() => {
    if (!liveMatch) return null;
    const qId = liveMatch.questionIds[liveMatch.questionsCompleted];
    return qId ? (QUESTION_BANK.find((q) => q.id === qId) ?? null) : null;
  }, [liveMatch]);

  function toggleParticipant(id: string) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    vibrate();
  }

  function initTournament() {
    const participants = joinedParticipants.filter((p) =>
      selectedIds.has(p.id),
    );
    if (participants.length < 2) return;
    socket.emit("tournament:init", participants);
    vibrate();
  }

  function startMatch(matchId: string) {
    socket.emit("tournament:start-match", { matchId, timeLimit });
    setSelectedMatchId(matchId);
    vibrate();
  }

  function resolveQuestion() {
    socket.emit("tournament:resolve-question");
    vibrate();
  }
  function nextQuestion() {
    socket.emit("tournament:next-question", { timeLimit });
    vibrate();
  }
  function advanceBracket() {
    socket.emit("tournament:advance");
    vibrate();
  }

  function resetTournament() {
    socket.emit("tournament:reset");
    setSelectedMatchId(null);
    vibrate();
  }

  // ── IDLE — before the presenter has activated the arena ──────────────────
  // Just shows an "Enter Arena" button. Nothing is visible on Display yet.
  if (phase === "idle") {
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Trophy size={14} className="text-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Tournament Arena
          </p>
        </div>

        <div className="rounded-xl border border-amber-400/15 bg-amber-950/10 p-4 space-y-2">
          <p className="text-[10px] font-bold text-amber-300/80 uppercase tracking-widest">
            Not yet active
          </p>
          <p className="text-[10px] text-slate-400 leading-5 normal-case">
            The Display is currently showing the presentation. Activating the
            arena will take over the Display with the tournament idle screen so
            the audience knows what's coming.
          </p>
        </div>

        <button
          onClick={() => {
            socket.emit("tournament:lobby");
            vibrate();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98]"
        >
          <Trophy size={14} />
          Enter Arena — Activate on Display
        </button>
      </div>
    );
  }

  // ── LOBBY — arena is on Display, presenter is setting up contestants ──────
  if (phase === "lobby") {
    const selected = joinedParticipants.filter((p) => selectedIds.has(p.id));
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Trophy size={14} className="text-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Tournament Setup
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3">
          <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1 animate-pulse">
            // Arena active on Display
          </p>
          <p className="text-[10px] text-slate-400 leading-5 normal-case">
            The audience can see the arena idle screen. Select contestants below
            and draw the bracket when ready.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Audience ({joinedParticipants.length} joined)
            </p>
            <button
              onClick={() =>
                setSelectedIds(new Set(joinedParticipants.map((p) => p.id)))
              }
              className="text-[10px] text-cyan-400 font-bold"
            >
              Select all
            </button>
          </div>
          {joinedParticipants.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">
              Waiting for audience to join at /audience…
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {joinedParticipants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition active:scale-[0.98] ${selectedIds.has(p.id) ? "border-cyan-400/40 bg-cyan-950/20" : "border-slate-800 bg-slate-900/20"}`}
                >
                  <img
                    src={dicebearUrl(p.name)}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                  <span className="flex-1 text-[11px] font-bold text-slate-300">
                    {p.name}
                  </span>
                  {selectedIds.has(p.id) && (
                    <CheckCircle2
                      size={12}
                      className="text-cyan-400 shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
          {selected.length > 0 && selected.length < 2 && (
            <p className="text-[10px] text-amber-400/70">
              Select at least 2 contestants
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3 space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Hash size={11} />
            <span>
              {QUESTIONS_PER_MATCH} questions per showdown ·{" "}
              {QUESTION_BANK.length}-question bank
            </span>
          </div>
          <TimeLimitSlider value={timeLimit} onChange={setTimeLimit} />
        </div>

        <button
          onClick={initTournament}
          disabled={selected.length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98] disabled:opacity-30"
        >
          <Trophy size={14} />
          Draw the Bracket ({selected.length} selected)
        </button>

        <button
          onClick={resetTournament}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 active:scale-95"
        >
          <RotateCcw size={12} />
          Exit Arena
        </button>
      </div>
    );
  }

  // ── SEEDING ────────────────────────────────────────────────────────────────
  if (phase === "seeding") {
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Swords size={14} className="text-cyan-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            Bracket Draw
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
          <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-2 animate-pulse">
            // Drawing in progress on Display
          </p>
          <p className="text-[10px] text-slate-400 leading-5 normal-case">
            {QUESTIONS_PER_MATCH} random questions assigned per match.
          </p>
        </div>
        <div className="space-y-1.5">
          {bracket?.rounds[0].map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-2"
            >
              <img
                src={dicebearUrl(match.playerA.name)}
                alt=""
                className="h-5 w-5 rounded-full"
              />
              <span className="text-[11px] font-bold text-slate-300 flex-1">
                {match.playerA.name}
              </span>
              <span className="text-[9px] text-slate-500 font-black">VS</span>
              <span className="text-[11px] font-bold text-slate-300 flex-1 text-right">
                {match.playerB.name}
              </span>
              <img
                src={dicebearUrl(match.playerB.name)}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            socket.emit("tournament:reveal-bracket");
            vibrate();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98]"
        >
          <ChevronRight size={14} />
          Show Full Bracket
        </button>
        <button
          onClick={resetTournament}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 active:scale-95"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    );
  }

  // ── BRACKET REVEAL / UPDATE ────────────────────────────────────────────────
  if (phase === "bracket-reveal" || phase === "bracket-update") {
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Users size={14} className="text-cyan-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            {roundLabel} — Select Match
          </p>
        </div>
        <div className="space-y-2">
          {pendingMatches.map((match) => (
            <button
              key={match.id}
              onClick={() => {
                setSelectedMatchId(
                  match.id === selectedMatchId ? null : match.id,
                );
                vibrate();
              }}
              className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${selectedMatchId === match.id ? "border-cyan-400/40 bg-cyan-950/30" : "border-slate-800 bg-slate-900/30"}`}
            >
              <img
                src={dicebearUrl(match.playerA.name)}
                alt=""
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-200 truncate">
                  {match.playerA.name}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  vs
                </p>
                <p className="text-[11px] font-black text-slate-200 truncate">
                  {match.playerB.name}
                </p>
              </div>
              <img
                src={dicebearUrl(match.playerB.name)}
                alt=""
                className="h-8 w-8 rounded-full"
              />
              {selectedMatchId === match.id && (
                <CheckCircle2 size={16} className="shrink-0 text-cyan-400" />
              )}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
          <TimeLimitSlider value={timeLimit} onChange={setTimeLimit} />
          <p className="mt-1.5 text-[10px] text-slate-600">
            Applied to all {QUESTIONS_PER_MATCH} questions in the showdown
          </p>
        </div>
        <button
          onClick={() => selectedMatchId && startMatch(selectedMatchId)}
          disabled={!selectedMatchId}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98] disabled:opacity-30"
        >
          <Play size={14} />
          Start Showdown
        </button>
        <button
          onClick={resetTournament}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 active:scale-95"
        >
          <RotateCcw size={12} />
          Reset Tournament
        </button>
      </div>
    );
  }

  // ── MATCH ACTIVE ────────────────────────────────────────────────────────────
  if (phase === "match-active" && liveMatch) {
    const q = state.currentQuestion;
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Swords size={14} className="text-cyan-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            Showdown Live
          </p>
          <span className="ml-auto text-[10px] text-slate-500">
            Q{q?.questionNumber}/{QUESTIONS_PER_MATCH} · {answeredCount}/2
          </span>
        </div>
        <MatchScoreboard match={liveMatch} />
        <div className="grid grid-cols-2 gap-2">
          {[liveMatch.playerA, liveMatch.playerB].map((player) => {
            const answered = state.matchAnswers.some(
              (a) => a.participantId === player.id,
            );
            return (
              <div
                key={player.id}
                className={`rounded-xl border p-2 text-center ${answered ? "border-emerald-400/30 bg-emerald-950/20" : "border-slate-800 bg-slate-900/20"}`}
              >
                <p className="text-[10px] font-black text-slate-300 truncate">
                  {player.name}
                </p>
                <p
                  className={`text-[9px] font-bold mt-0.5 ${answered ? "text-emerald-400" : "text-slate-600"}`}
                >
                  {answered ? "✓ Answered" : "Waiting…"}
                </p>
              </div>
            );
          })}
        </div>
        {q && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
              Question {q.questionNumber} of {QUESTIONS_PER_MATCH}
            </p>
            <p className="text-[11px] text-slate-200 font-bold leading-5">
              {q.prompt}
            </p>
            <p className="mt-1.5 text-[10px] text-emerald-400/80">
              ✓ Correct: {q.options[q.correctIndex]}
            </p>
          </div>
        )}
        <button
          onClick={resolveQuestion}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black active:scale-[0.98] ${bothAnswered ? "bg-emerald-300 text-slate-950" : "bg-amber-400/20 text-amber-300 border border-amber-400/30"}`}
        >
          <SkipForward size={14} />
          {bothAnswered ? "Score Question" : "End & Score Now"}
        </button>
      </div>
    );
  }

  // ── QUESTION RESULT ─────────────────────────────────────────────────────────
  if (phase === "question-result" && liveMatch) {
    const q = state.currentQuestion;
    const questionsLeft = QUESTIONS_PER_MATCH - liveMatch.questionsCompleted;
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Q{q?.questionNumber} Scored
          </p>
          <span className="ml-auto text-[10px] text-slate-500">
            {questionsLeft} to go
          </span>
        </div>
        <MatchScoreboard match={liveMatch} />
        {q && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/10 p-3">
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-1">
              Correct Answer
            </p>
            <p className="text-[11px] font-bold text-white">
              {q.options[q.correctIndex]}
            </p>
          </div>
        )}
        {nextQuestionPreview && (
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Up Next — Q{liveMatch.questionsCompleted + 1}
            </p>
            <p className="text-[11px] text-slate-300 leading-5 line-clamp-2">
              {nextQuestionPreview.prompt}
            </p>
            <div className="mt-1.5 flex gap-2">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${nextQuestionPreview.difficulty === "easy" ? "border-emerald-400/30 text-emerald-400 bg-emerald-950/20" : nextQuestionPreview.difficulty === "medium" ? "border-amber-400/30 text-amber-400 bg-amber-950/20" : "border-red-400/30 text-red-400 bg-red-950/20"}`}
              >
                {nextQuestionPreview.difficulty}
              </span>
              <span className="text-[9px] text-slate-600 capitalize">
                {nextQuestionPreview.category}
              </span>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
          <TimeLimitSlider value={timeLimit} onChange={setTimeLimit} />
        </div>
        <button
          onClick={nextQuestion}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98]"
        >
          <Play size={14} />
          Next Question ({liveMatch.questionsCompleted + 1}/
          {QUESTIONS_PER_MATCH})
        </button>
      </div>
    );
  }

  // ── MATCH RESULT ────────────────────────────────────────────────────────────
  if (phase === "match-result" && liveMatch) {
    const winner =
      liveMatch.winnerId === liveMatch.playerA.id
        ? liveMatch.playerA
        : liveMatch.playerB;
    const loser =
      liveMatch.winnerId === liveMatch.playerA.id
        ? liveMatch.playerB
        : liveMatch.playerA;
    const remainingInRound = currentRound.filter(
      (m) => !m.winnerId && m.id !== liveMatch.id,
    );
    const roundDone = remainingInRound.length === 0;
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Crown size={14} className="text-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Showdown Complete
          </p>
        </div>
        <MatchScoreboard match={liveMatch} />
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/10 p-3 flex items-center gap-3">
          <img
            src={dicebearUrl(winner.name)}
            alt=""
            className="h-10 w-10 rounded-full"
          />
          <div>
            <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider">
              Winner
            </p>
            <p className="text-sm font-black text-white">{winner.name}</p>
            <p className="text-[10px] text-amber-300">
              {liveMatch.scores[winner.id] ?? 0} pts vs{" "}
              {liveMatch.scores[loser.id] ?? 0} pts
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            Questions in this showdown
          </p>
          {liveMatch.questionIds.map((qId, idx) => {
            const bankQ = QUESTION_BANK.find((q) => q.id === qId);
            if (!bankQ) return null;
            return (
              <div
                key={qId}
                className="flex items-start gap-2 py-1.5 border-t border-slate-800/50 first:border-t-0"
              >
                <span className="text-[9px] text-slate-600 font-black w-4 shrink-0">
                  {idx + 1}.
                </span>
                <p className="text-[10px] text-slate-400 leading-4 line-clamp-2">
                  {bankQ.prompt}
                </p>
              </div>
            );
          })}
        </div>
        {!roundDone ? (
          <>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {remainingInRound.length} match
              {remainingInRound.length > 1 ? "es" : ""} remaining
            </p>
            <div className="space-y-2">
              {remainingInRound.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    socket.emit("tournament:reveal-bracket");
                    vibrate();
                  }}
                  className="w-full flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-2 text-left active:scale-[0.98]"
                >
                  <img
                    src={dicebearUrl(m.playerA.name)}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                  <span className="text-[11px] font-bold text-slate-300 flex-1">
                    {m.playerA.name}
                  </span>
                  <span className="text-[9px] text-slate-500">vs</span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {m.playerB.name}
                  </span>
                  <img
                    src={dicebearUrl(m.playerB.name)}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                  <ChevronRight size={12} className="text-slate-500" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={advanceBracket}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-xs font-black text-slate-950 active:scale-[0.98]"
          >
            <ChevronRight size={14} />
            Advance to Next Round
          </button>
        )}
        <button
          onClick={resetTournament}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 active:scale-95"
        >
          <RotateCcw size={12} />
          Reset Tournament
        </button>
      </div>
    );
  }

  // ── CHAMPION ─────────────────────────────────────────────────────────────────
  if (phase === "champion") {
    return (
      <div className="space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Crown size={14} className="text-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Champion Crowned
          </p>
        </div>
        {champion && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-950/10 p-4 flex flex-col items-center gap-3 text-center">
            <img
              src={dicebearUrl(champion.name)}
              alt={champion.name}
              className="h-16 w-16 rounded-full border-2 border-amber-400"
            />
            <div>
              <p className="text-[10px] text-amber-400/60 font-bold uppercase tracking-widest">
                Champion
              </p>
              <p className="text-xl font-black text-white">{champion.name}</p>
            </div>
          </div>
        )}
        <button
          onClick={resetTournament}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-xs font-bold text-slate-200 active:scale-[0.98]"
        >
          <RotateCcw size={14} />
          New Tournament
        </button>
      </div>
    );
  }

  // ── Fallback after refresh into unexpected phase ──────────────────────────
  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-950/10 p-3">
        <AlertCircle size={14} className="text-amber-400 shrink-0" />
        <p className="text-[10px] text-amber-300">
          Reconnected. Phase: <span className="font-black">{phase}</span>
        </p>
      </div>
      <button
        onClick={resetTournament}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 active:scale-95"
      >
        <RotateCcw size={12} />
        Reset Tournament
      </button>
    </div>
  );
}
