/**
 * AudienceTournament.tsx
 *
 * Drop this component into your existing Audience.tsx.
 * When a tournament is active, it REPLACES the normal answer/ask tabs
 * (same pattern as the existing quiz takeover).
 *
 * Usage in Audience.tsx:
 *
 *   import { AudienceTournament } from "./AudienceTournament";
 *
 *   // Add near the top of the Audience component:
 *   const [tournament, setTournament] = useState<TournamentState | null>(null);
 *
 *   // In the useEffect socket listener block:
 *   socket.on("tournament:state", setTournament);
 *   // In the cleanup:
 *   socket.off("tournament:state", setTournament);
 *
 *   // In the render, add this BEFORE the quiz takeover check:
 *   if (tournament && tournament.phase !== "idle") {
 *     return (
 *       <AudienceTournament
 *         state={tournament}
 *         participant={participant}
 *       />
 *     );
 *   }
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Swords,
  Trophy,
  XCircle,
  Shield,
} from "lucide-react";
import type { TournamentState } from "../../shared/types/Tournament";
import { socket } from "../../socket";

type Participant = {
  id: string;
  name: string;
};

const optionLetters = ["A", "B", "C", "D"];

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

// ── Time ring component ──────────────────────────────────────────────────────

function TimeRing({ pct, seconds }: { pct: number; seconds: number }) {
  const color = pct > 50 ? "#22d3ee" : pct > 25 ? "#f59e0b" : "#ef4444";
  const r = 36;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${circ * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s" }}
        />
      </svg>
      <span className="absolute text-2xl font-black text-white">{seconds}</span>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────────────

export function AudienceTournament({
  state,
  participant,
}: {
  state: TournamentState;
  participant: Participant;
}) {
  const [myVoteIndex, setMyVoteIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset vote when a new match/question starts
  const questionId = state.currentQuestion?.id;
  useEffect(() => {
    setMyVoteIndex(null);
  }, [questionId]);

  // Timer
  useEffect(() => {
    if (state.phase !== "match-active" || !state.currentQuestion || !state.matchStartedAt) return;

    const end = state.matchStartedAt + state.currentQuestion.timeLimit * 1000;

    timerRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, end - Date.now()));
    }, 50);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questionId, state.matchStartedAt]);

  // Derived: am I a combatant in the current match?
  const currentMatch = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return null;
    for (const round of state.bracket.rounds) {
      const m = round.find((r) => r.id === state.currentMatchId);
      if (m) return m;
    }
    return null;
  }, [state.bracket, state.currentMatchId]);

  const iAmCombatant = currentMatch
    ? currentMatch.playerA.id === participant.id ||
      currentMatch.playerB.id === participant.id
    : false;

  const myOpponent = iAmCombatant && currentMatch
    ? currentMatch.playerA.id === participant.id
      ? currentMatch.playerB
      : currentMatch.playerA
    : null;

  const iWon = currentMatch?.winnerId === participant.id;
  // const iLost = currentMatch?.winnerId && currentMatch.winnerId !== participant.id && iAmCombatant;
  const iAmChampion = state.championId === participant.id;

  const roundIndex = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return 0;
    for (let i = 0; i < state.bracket.rounds.length; i++) {
      if (state.bracket.rounds[i].some((m) => m.id === state.currentMatchId)) return i;
    }
    return 0;
  }, [state.bracket, state.currentMatchId]);

  function submitAnswer(optionIndex: number) {
    if (!state.currentQuestion || myVoteIndex !== null || !state.currentQuestion) return;
    if (state.phase !== "match-active") return;

    setMyVoteIndex(optionIndex);
    socket.emit("tournament:answer", {
      participantId: participant.id,
      questionId: state.currentQuestion.id,
      optionIndex,
    });
  }

  // ── IDLE / SEEDING ────────────────────────────────────────────────────────
  if (state.phase === "idle" || state.phase === "lobby" || state.phase === "seeding") {
    const myMatch = state.bracket?.rounds[0]?.find(
      (m) => m.playerA.id === participant.id || m.playerB.id === participant.id,
    );

    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-200">
            <Trophy size={14} />
            {state.phase === "lobby" ? "Arena Opening" : "Tournament Starting"}
          </div>

          <h1 className="text-3xl font-black">The Great Cyber Quiz</h1>
          <p className="mt-2 text-slate-400 text-sm">
            {state.phase === "lobby"
              ? "The arena is being prepared. Stand by for your matchup."
              : "The bracket is being drawn. Get ready for battle."}
          </p>

          {myMatch && (
            <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-950/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-4">
                Your First Matchup
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <img
                    src={dicebearUrl(participant.name)}
                    alt={participant.name}
                    className="h-16 w-16 rounded-full border-2 border-cyan-400"
                  />
                  <p className="text-sm font-black text-white text-center">{participant.name}</p>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">You</span>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Swords size={20} className="text-slate-400" />
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">vs</p>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <img
                    src={dicebearUrl(myOpponent?.name ?? "Unknown")}
                    alt={myOpponent?.name}
                    className="h-16 w-16 rounded-full border-2 border-slate-600"
                  />
                  <p className="text-sm font-black text-white text-center">
                    {myOpponent?.name ?? (myMatch?.playerA.id === participant.id ? myMatch.playerB.name : myMatch.playerA.name)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-300">
              Stay on this page — your question will appear automatically when it's your turn to compete.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ── BRACKET REVEAL / UPDATE: watching ────────────────────────────────────
  if (state.phase === "bracket-reveal" || state.phase === "bracket-update") {
    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            {state.phase === "bracket-update" ? "Round Advancing" : "Bracket Drawn"}
          </div>

          <h1 className="text-3xl font-black">
            {state.phase === "bracket-update" ? "Next Round" : "The Bracket"}
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Watch the big screen — your match will begin soon.
          </p>

          {/* My next potential match */}
          {(() => {
            const lastRound = state.bracket?.rounds[state.bracket.rounds.length - 1] ?? [];
            const myNextMatch = lastRound.find(
              (m) => !m.winnerId && (m.playerA.id === participant.id || m.playerB.id === participant.id),
            );

            if (!myNextMatch) return (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">
                  You've been eliminated or are already a winner. Watch the competition unfold on the main screen.
                </p>
              </div>
            );

            const opponent = myNextMatch.playerA.id === participant.id
              ? myNextMatch.playerB
              : myNextMatch.playerA;

            const roundLabel = getRoundLabel(
              (state.bracket?.rounds.length ?? 1) - 1,
              state.bracket?.totalRounds ?? 1,
            );

            return (
              <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-[#10151f] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-4">
                  Your Next Match · {roundLabel}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={dicebearUrl(participant.name)} alt="" className="h-14 w-14 rounded-full border-2 border-cyan-400" />
                    <p className="text-sm font-black text-white">{participant.name}</p>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">You</span>
                  </div>
                  <Swords size={18} className="text-slate-400 shrink-0" />
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={dicebearUrl(opponent.name)} alt="" className="h-14 w-14 rounded-full border-2 border-slate-600" />
                    <p className="text-sm font-black text-white">{opponent.name}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </main>
    );
  }

  // ── MATCH ACTIVE ──────────────────────────────────────────────────────────
  if (state.phase === "match-active" && state.currentQuestion) {
    const q = state.currentQuestion;
    const timeLimit = q.timeLimit * 1000;
    const timePct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
    const secs = Math.ceil(timeLeft / 1000);
    const roundLabel = getRoundLabel(roundIndex, state.bracket?.totalRounds ?? 1);

    // Spectator view — not my match
    if (!iAmCombatant) {
      return (
        <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
          <section className="mx-auto max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-700/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Shield size={14} />
              Spectating · {roundLabel}
            </div>

            {currentMatch && (
              <>
                <h1 className="text-2xl font-black">Match in Progress</h1>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={dicebearUrl(currentMatch.playerA.name)} alt="" className="h-16 w-16 rounded-full border-2 border-slate-600" />
                    <p className="text-sm font-black text-white text-center">{currentMatch.playerA.name}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <Swords size={20} className="text-cyan-400" />
                    <TimeRing pct={timePct} seconds={secs} />
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={dicebearUrl(currentMatch.playerB.name)} alt="" className="h-16 w-16 rounded-full border-2 border-slate-600" />
                    <p className="text-sm font-black text-white text-center">{currentMatch.playerB.name}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                    Question
                  </p>
                  <p className="text-sm text-slate-300 leading-6">{q.prompt}</p>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Your turn will come — stay ready.
                </p>
              </>
            )}
          </section>
        </main>
      );
    }

    // ── IT'S MY TURN ────────────────────────────────────────────────────────
    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            <Swords size={14} />
            Your Turn · {roundLabel}
          </div>

          {/* Opponent callout */}
          {myOpponent && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/30 px-4 py-3">
              <img src={dicebearUrl(myOpponent.name)} alt="" className="h-10 w-10 rounded-full border border-slate-600" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">You vs</p>
                <p className="text-sm font-black text-white">{myOpponent.name}</p>
              </div>
              <div className="ml-auto">
                <TimeRing pct={timePct} seconds={secs} />
              </div>
            </div>
          )}

          {/* Question */}
          <div className="rounded-3xl border border-cyan-400/20 bg-[#10151f] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-4">
              Question
            </p>
            <h2 className="text-xl font-black leading-snug text-white mb-6">{q.prompt}</h2>

            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isMine = myVoteIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => submitAnswer(idx)}
                    disabled={myVoteIndex !== null || timeLeft === 0}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.98] disabled:active:scale-100 ${
                      isMine
                        ? "border-cyan-300/40 bg-cyan-300/10"
                        : "border-white/10 bg-white/[0.05]"
                    } ${myVoteIndex !== null && !isMine ? "opacity-40" : ""}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                      isMine ? "bg-cyan-300/20 text-cyan-200" : "bg-white/10 text-slate-300"
                    }`}>
                      {optionLetters[idx]}
                    </span>
                    <span className="flex-1 font-semibold text-white">{option}</span>
                    {isMine && (
                      <span className="shrink-0 text-xs font-bold text-cyan-300">Your pick</span>
                    )}
                  </button>
                );
              })}
            </div>

            {myVoteIndex !== null && (
              <p className="mt-5 text-center text-sm text-cyan-300">
                Answer locked in. Waiting for result...
              </p>
            )}

            {myVoteIndex === null && timeLeft === 0 && (
              <p className="mt-5 text-center text-sm text-red-400">
                Time's up! No answer submitted.
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  // ── MATCH RESULT ──────────────────────────────────────────────────────────
  if (state.phase === "match-result" && currentMatch && iAmCombatant) {
    const q = state.currentQuestion;
    const myScore = currentMatch.scores[participant.id] ?? 0;
    const opponentScore = myOpponent ? (currentMatch.scores[myOpponent.id] ?? 0) : 0;

    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          {iWon ? (
            <>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
                <CheckCircle2 size={14} />
                You Won!
              </div>
              <h1 className="text-4xl font-black text-white">You advance!</h1>
              <p className="mt-2 text-emerald-300">Outstanding. Stay ready for your next match.</p>
            </>
          ) : (
            <>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-200">
                <XCircle size={14} />
                Eliminated
              </div>
              <h1 className="text-4xl font-black text-white">Good effort!</h1>
              <p className="mt-2 text-slate-400">The competition continues. Watch the rest unfold.</p>
            </>
          )}

          {/* Score comparison */}
          <div className="mt-8 flex gap-3">
            <div className={`flex-1 rounded-2xl border p-4 text-center ${iWon ? "border-emerald-400/30 bg-emerald-950/20" : "border-slate-700/30 bg-slate-900/20"}`}>
              <img src={dicebearUrl(participant.name)} alt="" className="h-12 w-12 rounded-full mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold">You</p>
              <p className="text-2xl font-black text-amber-300">{myScore}</p>
            </div>
            <div className="text-slate-500 font-black text-sm self-center">vs</div>
            <div className={`flex-1 rounded-2xl border p-4 text-center ${!iWon ? "border-emerald-400/30 bg-emerald-950/20" : "border-slate-700/30 bg-slate-900/20 opacity-60"}`}>
              {myOpponent && <img src={dicebearUrl(myOpponent.name)} alt="" className="h-12 w-12 rounded-full mx-auto mb-2" />}
              <p className="text-xs text-slate-400 font-bold">{myOpponent?.name}</p>
              <p className="text-2xl font-black text-amber-300">{opponentScore}</p>
            </div>
          </div>

          {/* Correct answer reveal */}
          {q && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-950/10 p-4">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-2">
                Correct Answer
              </p>
              <p className="text-sm font-bold text-white">
                {optionLetters[q.correctIndex]}: {q.options[q.correctIndex]}
              </p>
              {myVoteIndex !== null && myVoteIndex !== q.correctIndex && (
                <p className="mt-1 text-[11px] text-red-300">
                  You answered: {optionLetters[myVoteIndex]}: {q.options[myVoteIndex]}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  // Spectator during match result
  if (state.phase === "match-result" && !iAmCombatant) {
    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-slate-700/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Shield size={14} />
            Match Result
          </div>
          <h1 className="text-2xl font-black">Round Complete</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Watch the big screen for the result. Next match coming up.
          </p>
        </section>
      </main>
    );
  }

  // ── CHAMPION ──────────────────────────────────────────────────────────────
  if (state.phase === "champion") {
    const champion = state.participants.find((p) => p.id === state.championId);

    return (
      <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
        <section className="mx-auto max-w-md text-center">
          {iAmChampion ? (
            <>
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img
                    src={dicebearUrl(participant.name)}
                    alt={participant.name}
                    className="h-24 w-24 rounded-full border-4 border-amber-400"
                    style={{ boxShadow: "0 0 40px rgba(251,191,36,0.5)" }}
                  />
                  <div className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400">
                    <Crown size={20} className="text-slate-950" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-black text-white uppercase">Champion!</h1>
              <p className="mt-3 text-amber-300 text-xl font-bold">You are the Cybersecurity Champion</p>
              <p className="mt-4 text-slate-500 text-sm">
                You've proven your knowledge across all rounds. Well done!
              </p>
            </>
          ) : (
            <>
              <Trophy size={48} className="mx-auto mb-6 text-amber-400" />
              <h1 className="text-3xl font-black">Tournament Complete</h1>
              {champion && (
                <>
                  <p className="mt-3 text-slate-400">The champion is:</p>
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <img
                      src={dicebearUrl(champion.name)}
                      alt={champion.name}
                      className="h-16 w-16 rounded-full border-2 border-amber-400"
                    />
                    <p className="text-2xl font-black text-amber-300">{champion.name}</p>
                  </div>
                </>
              )}
              <p className="mt-6 text-slate-500 text-sm">
                Great participation — every question made you sharper.
              </p>
            </>
          )}
        </section>
      </main>
    );
  }

  // Fallback for bracket-update spectator view
  return (
    <main className="min-h-screen bg-[#07080b] px-5 py-8 text-white">
      <section className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Stand By</h1>
        <p className="mt-2 text-slate-400">The next match is being set up...</p>
      </section>
    </main>
  );
}