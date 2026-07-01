import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Swords, Crown } from "lucide-react";

import type {
  TournamentState,
  TournamentMatch,
} from "../../shared/types/Tournament";

const optionLetters = ["A", "B", "C", "D"];

function dicebearUrl(name: string, style = "adventurer") {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=0f172a&radius=50`;
}

function getRoundLabel(roundIndex: number, totalRounds: number) {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Semi-Final";
  if (remaining === 3) return "Quarter-Final";
  return `Round ${roundIndex + 1}`;
}

// ── Participant Avatar ──────────────────────────────────────────────────────

function Avatar({
  name,
  size = 64,
  ring = false,
  glow = "none",
}: {
  name: string;
  size?: number;
  ring?: boolean;
  glow?: "cyan" | "amber" | "green" | "red" | "none";
}) {
  const glowColor = {
    cyan: "shadow-[0_0_24px_rgba(34,211,238,0.6)]",
    amber: "shadow-[0_0_24px_rgba(251,191,36,0.6)]",
    green: "shadow-[0_0_24px_rgba(52,211,153,0.6)]",
    red: "shadow-[0_0_24px_rgba(248,113,113,0.6)]",
    none: "",
  }[glow];

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border-2 ${
        ring ? "border-cyan-400" : "border-slate-700"
      } ${glowColor} transition-all duration-500`}
      style={{ width: size, height: size }}
    >
      <img
        src={dicebearUrl(name)}
        alt={name}
        width={size}
        height={size}
        className="h-full w-full"
      />
    </div>
  );
}

// ── Vertical Bracket Layout ─────────────────────────────────────────────────
//
// Round 0 (bottom) gets matches evenly spaced. Every later round's match is
// vertically centered at the average y of the two matches feeding it — the
// standard bottom-up bracket-tree centering algorithm. Works for any
// power-of-2 player count.
//
// Sizes are deliberately generous — for tournaments with a lot of
// contestants the tree gets tall/wide rather than the cards shrinking.
// Focus is handled by auto-scrolling to the relevant column/match instead
// of zooming the whole tree out (see useAutoFocus below).

const BRACKET_CARD_H = 92; // px, height of a match card
const BRACKET_SLOT_H = 160; // px, vertical spacing unit per round-0 match
const BRACKET_COL_W = 300; // px, width per round column
const BRACKET_COL_GAP = 96; // px, horizontal gap between round columns

function useBracketLayout(rounds: TournamentMatch[][]) {
  return useMemo(() => {
    if (!rounds || rounds.length === 0)
      return { positions: [] as number[][], height: 0 };

    const positions: number[][] = [];
    const round0Count = rounds[0].length;
    const totalHeight = round0Count * BRACKET_SLOT_H;

    positions[0] = rounds[0].map(
      (_, i) => i * BRACKET_SLOT_H + BRACKET_SLOT_H / 2,
    );

    for (let r = 1; r < rounds.length; r++) {
      positions[r] = rounds[r].map((_, i) => {
        const childA = positions[r - 1][i * 2];
        const childB = positions[r - 1][i * 2 + 1];
        return (childA + childB) / 2;
      });
    }

    return { positions, height: totalHeight };
  }, [rounds]);
}

// ── Bracket Match Card (sized for the vertical layout) ──────────────────────

function BracketMatchCard({
  match,
  isCurrent,
  isFinal,
  revealed,
}: {
  match: TournamentMatch;
  isCurrent: boolean;
  isFinal: boolean;
  revealed: boolean;
}) {
  return (
    <motion.div
      data-match-id={match.id}
      initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
      animate={{
        opacity: revealed ? 1 : 0,
        scale: revealed ? (isCurrent ? 1.05 : 1) : 0.85,
        rotate: revealed ? 0 : -4,
      }}
      transition={{ duration: 0.45, type: "spring", bounce: 0.4 }}
      className={`rounded-2xl border px-4 py-3 transition-all duration-500 ${
        isCurrent
          ? "border-cyan-400/70 bg-cyan-950/40 shadow-[0_0_36px_rgba(34,211,238,0.3)]"
          : isFinal
            ? "border-amber-400/40 bg-amber-950/20 shadow-[0_0_28px_rgba(251,191,36,0.15)]"
            : "border-slate-700/40 bg-slate-900/50"
      }`}
      style={{ width: BRACKET_COL_W - 32, height: BRACKET_CARD_H }}
    >
      {[match.playerA, match.playerB].map((player, idx) => {
        const isWinner = match.winnerId === player.id;
        const isLoser = match.winnerId && match.winnerId !== player.id;
        const score = match.scores[player.id] ?? 0;

        return (
          <div
            key={player.id}
            className={`flex items-center gap-2.5 ${idx === 0 ? "border-b border-slate-800/60 pb-1.5 mb-1.5" : ""}`}
          >
            <Avatar
              name={player.name}
              size={34}
              glow={isWinner ? "green" : "none"}
            />
            <span
              className={`flex-1 text-base font-bold truncate ${
                isWinner
                  ? "text-emerald-300"
                  : isLoser
                    ? "text-slate-500"
                    : "text-slate-300"
              }`}
            >
              {player.name === "BYE" ? "—" : player.name}
            </span>
            {score > 0 && (
              <span className="text-sm font-black text-amber-300">{score}</span>
            )}
            {isWinner && (
              <Crown size={16} className="shrink-0 text-amber-400" />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Bracket Connectors ───────────────────────────────────────────────────────
//
// Draws an L-shaped connector from each pair of round-r matches up into
// their round-(r+1) parent, animated as a draw-in trace synced to reveal.
function BracketConnectors({
  rounds,
  positions,
  height,
  revealedRounds,
}: {
  rounds: TournamentMatch[][];
  positions: number[][];
  height: number;
  revealedRounds: number;
}) {
  const paths: React.ReactNode[] = [];

  for (let r = 0; r < rounds.length - 1; r++) {
    const parentRound = positions[r + 1];
    const childRound = positions[r];

    // Child cards: right edge of column r
    const xChildEdge =
      r * (BRACKET_COL_W + BRACKET_COL_GAP) + BRACKET_COL_W - 16;
    // Parent cards: left edge of column r+1
    const xParentEdge = (r + 1) * (BRACKET_COL_W + BRACKET_COL_GAP) + 16;
    // Midpoint of the horizontal gap
    const xMid = (xChildEdge + xParentEdge) / 2;

    const isDrawn = r + 1 < revealedRounds;

    for (let i = 0; i < parentRound.length; i++) {
      const yParent = height - parentRound[i];
      const yChildA = height - childRound[i * 2];
      const yChildB = height - childRound[i * 2 + 1];

      // Two children merge into one parent:
      //   child A → right → mid → down/up to parent y → parent left edge
      //   child B → right → mid → up/down to parent y → (shares final segment)
      [yChildA, yChildB].forEach((yChild, j) => {
        const d = [
          `M ${xChildEdge} ${yChild}`, // start at right edge of child card
          `H ${xMid}`, // go right to midpoint
          `V ${yParent}`, // go up or down to parent's y
          `H ${xParentEdge}`, // arrive at left edge of parent card
        ].join(" ");

        paths.push(
          <motion.path
            key={`r${r}-${i}-${j}`}
            d={d}
            fill="none"
            stroke="rgba(100,116,139,0.45)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: isDrawn ? 1 : 0,
              opacity: isDrawn ? 1 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeInOut" }}
          />,
        );
      });
    }
  }

  const totalWidth =
    rounds.length * (BRACKET_COL_W + BRACKET_COL_GAP) - BRACKET_COL_GAP;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={totalWidth}
      height={height}
      style={{ overflow: "visible" }}
    >
      {paths}
    </svg>
  );
}

// ── Winner advance overlay — flies the winner's avatar from its old slot
// up into its new slot when a round completes ─────────────────────────────

function WinnerAdvanceOverlay({
  state,
  positions,
  height,
}: {
  state: TournamentState;
  positions: number[][];
  height: number;
}) {
  const bracket = state.bracket;
  if (!bracket || !state.lastCompletedMatchId) return null;

  let fromCoords: { x: number; y: number } | null = null;
  let toCoords: { x: number; y: number } | null = null;
  let winnerName = "";

  for (let r = 0; r < bracket.rounds.length; r++) {
    const idx = bracket.rounds[r].findIndex(
      (m) => m.id === state.lastCompletedMatchId,
    );
    if (idx === -1) continue;

    const match = bracket.rounds[r][idx];
    if (!match.winnerId) break;
    winnerName =
      match.winnerId === match.playerA.id
        ? match.playerA.name
        : match.playerB.name;

    fromCoords = {
      x: r * (BRACKET_COL_W + BRACKET_COL_GAP) + BRACKET_COL_W / 2,
      y: 40 + height - positions[r][idx],
    };

    const nextRound = bracket.rounds[r + 1];
    if (nextRound) {
      const parentIdx = Math.floor(idx / 2);
      toCoords = {
        x: (r + 1) * (BRACKET_COL_W + BRACKET_COL_GAP) + BRACKET_COL_W / 2,
        y: 40 + height - positions[r + 1][parentIdx],
      };
    }
    break;
  }

  if (!fromCoords || !toCoords || !winnerName) return null;

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      initial={{
        left: fromCoords.x - 32,
        top: fromCoords.y - 32,
        opacity: 0,
        scale: 0.6,
      }}
      animate={{
        left: toCoords.x - 32,
        top: toCoords.y - 32,
        opacity: [0, 1, 1, 0],
        scale: [0.6, 1.15, 1.15, 0.9],
      }}
      transition={{
        duration: 1.1,
        times: [0, 0.25, 0.8, 1],
        ease: "easeInOut",
      }}
    >
      <Avatar name={winnerName} size={64} ring glow="amber" />
    </motion.div>
  );
}

// ── Auto-focus: scroll the bracket container so the relevant column/match
// stays centered in view, rather than shrinking everything to fit ─────────

function useBracketAutoFocus(
  containerRef: React.RefObject<HTMLDivElement | null>,
  focusMatchId: string | null,
  deps: unknown[],
) {
  useEffect(() => {
    if (!focusMatchId || !containerRef.current) return;
    const el = containerRef.current.querySelector(
      `[data-match-id="${focusMatchId}"]`,
    );
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ── Bracket Tree Display (vertical, climbing bottom → top) ─────────────────

function BracketDisplay({
  state,
  revealProgress,
}: {
  state: TournamentState;
  revealProgress: number;
}) {
  const bracket = state.bracket;
  const { positions, height } = useBracketLayout(bracket?.rounds ?? []);
  const containerRef = useRef<HTMLDivElement>(null);

  const revealedRounds = bracket
    ? Math.ceil(revealProgress * bracket.rounds.length)
    : 0;

  // Focus priority: the active/current match, else the last completed one
  // (winner advance), else the most recently revealed round during the
  // initial bracket-reveal animation.
  const focusMatchId = useMemo(() => {
    if (!bracket) return null;
    if (state.currentMatchId) return state.currentMatchId;
    if (state.lastCompletedMatchId) return state.lastCompletedMatchId;
    const lastRevealedIdx = Math.min(
      revealedRounds - 1,
      bracket.rounds.length - 1,
    );
    if (lastRevealedIdx >= 0) {
      const round = bracket.rounds[lastRevealedIdx];
      return round[Math.floor(round.length / 2)]?.id ?? null;
    }
    return null;
  }, [
    bracket,
    state.currentMatchId,
    state.lastCompletedMatchId,
    revealedRounds,
  ]);

  useBracketAutoFocus(containerRef, focusMatchId, [
    focusMatchId,
    revealedRounds,
  ]);

  if (!bracket) return null;

  const totalWidth =
    bracket.rounds.length * (BRACKET_COL_W + BRACKET_COL_GAP) - BRACKET_COL_GAP;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-x-auto overflow-y-auto flex items-center justify-center scroll-smooth"
    >
      <div
        className="relative shrink-0"
        style={{ width: totalWidth, height: height + 40 }}
      >
        <div className="absolute inset-0" style={{ top: 40 }}>
          <BracketConnectors
            rounds={bracket.rounds}
            positions={positions}
            height={height}
            revealedRounds={revealedRounds}
          />
          {state.phase === "bracket-update" && (
            <WinnerAdvanceOverlay
              state={state}
              positions={positions}
              height={height}
            />
          )}
        </div>

        {bracket.rounds.map((round, rIdx) => {
          const label = getRoundLabel(rIdx, bracket.totalRounds);
          const isFinal = bracket.totalRounds - rIdx === 1;
          const revealed = rIdx < revealedRounds;

          return (
            <div key={rIdx}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: revealed ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="absolute text-sm font-black uppercase tracking-[0.3em] text-cyan-400 text-center"
                style={{
                  left: rIdx * (BRACKET_COL_W + BRACKET_COL_GAP),
                  width: BRACKET_COL_W,
                  top: 0,
                }}
              >
                {label}
              </motion.p>

              {round.map((match, mIdx) => {
                const centerY = positions[rIdx][mIdx];
                return (
                  <div
                    key={match.id}
                    className="absolute flex justify-center"
                    style={{
                      left: rIdx * (BRACKET_COL_W + BRACKET_COL_GAP),
                      width: BRACKET_COL_W,
                      top: 40 + height - centerY - BRACKET_CARD_H / 2,
                    }}
                  >
                    <BracketMatchCard
                      match={match}
                      isCurrent={match.id === state.currentMatchId}
                      isFinal={isFinal}
                      revealed={revealed}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Seeding Reveal Animation — shuffle, swap, lock ──────────────────────────
//
// Three internal stages:
//  1. shuffling — every slot rapidly cycles random contestant names/avatars
//  2. swapping  — a few real contestants visually trade slots (draw-machine feel)
//  3. locked    — final matchups settle, spring-in
//
// Purely visual — never mutates state.bracket itself.

function ShufflingSlotPlayer({
  candidatePool,
  size,
}: {
  candidatePool: { id: string; name: string }[];
  size: number;
}) {
  const [name, setName] = useState(candidatePool[0]?.name ?? "");

  useEffect(() => {
    if (candidatePool.length === 0) return;
    let i = 0;
    const id = setInterval(
      () => {
        i = (i + 1) % candidatePool.length;
        setName(candidatePool[i].name);
      },
      90 + Math.random() * 60,
    );
    return () => clearInterval(id);
  }, [candidatePool]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <AnimatePresence mode="wait">
        <motion.div
          key={name}
          initial={{ opacity: 0, y: -6, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, filter: "blur(2px)" }}
          transition={{ duration: 0.12 }}
        >
          <Avatar name={name} size={size} />
        </motion.div>
      </AnimatePresence>
      <p className="text-sm font-bold text-slate-400 text-center truncate max-w-[100px]">
        {name}
      </p>
    </div>
  );
}

function SwapSlotPlayer({
  player,
  size,
  isSwapping,
  swapDirection,
}: {
  player: { id: string; name: string };
  size: number;
  isSwapping: boolean;
  swapDirection: "in-left" | "in-right" | null;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id}
        className="flex flex-col items-center gap-1.5"
        initial={
          swapDirection === "in-left"
            ? { opacity: 0, x: -28, scale: 0.7 }
            : swapDirection === "in-right"
              ? { opacity: 0, x: 28, scale: 0.7 }
              : { opacity: 0, scale: 0.8 }
        }
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.35, type: "spring", bounce: 0.4 }}
      >
        <Avatar
          name={player.name}
          size={size}
          ring
          glow={isSwapping ? "cyan" : "none"}
        />
        <p className="text-sm font-bold text-slate-300 text-center truncate max-w-[100px]">
          {player.name}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

function SeedingReveal({ state }: { state: TournamentState }) {
  const initialMatches = state.bracket?.rounds[0] ?? [];
  const players = state.participants;

  const [stage, setStage] = useState<"shuffling" | "swapping" | "locked">(
    "shuffling",
  );
  const [matches, setMatches] = useState(initialMatches);
  const [activeSwap, setActiveSwap] = useState<{
    matchA: number;
    slotA: "playerA" | "playerB";
    matchB: number;
    slotB: "playerA" | "playerB";
  } | null>(null);

  // Reset whenever the server hands us a genuinely new set of round-0
  // matches (e.g. re-entering seeding for a new tournament). We key off
  // match ids joined into a string rather than the array reference itself,
  // since `state.bracket` is a fresh object on every socket broadcast even
  // when the matchups haven't changed — keying on identity would restart
  // the shuffle animation on every tick.
  const round0Key = (state.bracket?.rounds[0] ?? []).map((m) => m.id).join(",");

  useEffect(() => {
    setMatches(state.bracket?.rounds[0] ?? []);
    setStage("shuffling");
    setActiveSwap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round0Key]);

  useEffect(() => {
    const shuffleDuration = 2200;
    const t1 = setTimeout(() => setStage("swapping"), shuffleDuration);
    return () => clearTimeout(t1);
  }, [round0Key]);

  useEffect(() => {
    if (stage !== "swapping") return;
    if (initialMatches.length === 0) return;

    const numSwaps = Math.min(
      3,
      Math.max(1, Math.floor(initialMatches.length / 2)),
    );
    let count = 0;

    function doOneSwap() {
      setMatches((current) => {
        const matchA = Math.floor(Math.random() * current.length);
        let matchB = Math.floor(Math.random() * current.length);
        if (matchB === matchA) matchB = (matchB + 1) % current.length;
        const slotA: "playerA" | "playerB" =
          Math.random() < 0.5 ? "playerA" : "playerB";
        const slotB: "playerA" | "playerB" =
          Math.random() < 0.5 ? "playerA" : "playerB";

        setActiveSwap({ matchA, slotA, matchB, slotB });

        const next = current.map((m) => ({ ...m }));
        const tmp = next[matchA][slotA];
        next[matchA][slotA] = next[matchB][slotB];
        next[matchB][slotB] = tmp;
        return next;
      });

      setTimeout(() => setActiveSwap(null), 450);
    }

    const interval = setInterval(() => {
      count++;
      doOneSwap();
      if (count >= numSwaps) {
        clearInterval(interval);
        setTimeout(() => {
          setMatches(initialMatches); // ← restore server truth
          setActiveSwap(null);
          setStage("locked");
        }, 700);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [stage, initialMatches.length]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-sm uppercase tracking-[0.5em] text-cyan-400 font-black animate-pulse">
          [ BRACKET_DRAW //{" "}
          {stage === "shuffling"
            ? "RANDOMISING"
            : stage === "swapping"
              ? "FINALISING"
              : "LOCKED"}{" "}
          ]
        </p>
        <h1 className="mt-4 text-5xl font-black uppercase text-white">
          Drawing Matchups
        </h1>
        <p className="mt-3 text-slate-500 text-base">
          {stage === "shuffling"
            ? "Contestants are being scrambled for the draw"
            : stage === "swapping"
              ? "Settling into final positions"
              : "Matchups confirmed"}
        </p>
      </motion.div>

      {matches.length > 0 && (
        <div className="grid grid-cols-2 gap-5">
          {matches.map((match, idx) => {
            const isSwapping =
              activeSwap?.matchA === idx || activeSwap?.matchB === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: idx * 0.08,
                  duration: 0.5,
                  type: "spring",
                }}
                className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-5 flex items-center gap-5"
              >
                <div className="flex-1">
                  {stage === "shuffling" ? (
                    <ShufflingSlotPlayer candidatePool={players} size={64} />
                  ) : (
                    <SwapSlotPlayer
                      player={match.playerA}
                      size={64}
                      isSwapping={isSwapping}
                      swapDirection={
                        activeSwap &&
                        ((activeSwap.matchA === idx &&
                          activeSwap.slotA === "playerA") ||
                          (activeSwap.matchB === idx &&
                            activeSwap.slotB === "playerA"))
                          ? "in-left"
                          : null
                      }
                    />
                  )}
                </div>

                <div className="flex-1 text-center">
                  <motion.div
                    animate={stage === "locked" ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <Swords size={26} className="mx-auto text-cyan-400" />
                    <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
                      vs
                    </p>
                  </motion.div>
                </div>

                <div className="flex-1">
                  {stage === "shuffling" ? (
                    <ShufflingSlotPlayer candidatePool={players} size={64} />
                  ) : (
                    <SwapSlotPlayer
                      player={match.playerB}
                      size={64}
                      isSwapping={isSwapping}
                      swapDirection={
                        activeSwap &&
                        ((activeSwap.matchA === idx &&
                          activeSwap.slotA === "playerB") ||
                          (activeSwap.matchB === idx &&
                            activeSwap.slotB === "playerB"))
                          ? "in-right"
                          : null
                      }
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Match Arena ─────────────────────────────────────────────────────────────

function MatchArena({ state }: { state: TournamentState }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const match = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return null;
    for (const round of state.bracket.rounds) {
      const m = round.find((r) => r.id === state.currentMatchId);
      if (m) return m;
    }
    return null;
  }, [state]);

  const roundIndex = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return 0;
    for (let i = 0; i < state.bracket.rounds.length; i++) {
      if (state.bracket.rounds[i].some((m) => m.id === state.currentMatchId))
        return i;
    }
    return 0;
  }, [state]);

  useEffect(() => {
    if (
      state.phase !== "match-active" ||
      !state.currentQuestion ||
      !state.matchStartedAt
    )
      return;

    const end = state.matchStartedAt + state.currentQuestion.timeLimit * 1000;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, end - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0 && timerRef.current) clearInterval(timerRef.current);
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentMatchId, state.currentQuestion?.id, state.matchStartedAt]);

  if (!match || !state.currentQuestion) return null;

  const q = state.currentQuestion;
  const timeLimit = q.timeLimit * 1000;
  const timePct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const answeredIds = new Set(state.matchAnswers.map((a) => a.participantId));
  const aAnswered = answeredIds.has(match.playerA.id);
  const bAnswered = answeredIds.has(match.playerB.id);
  const aScore = match.scores[match.playerA.id] ?? 0;
  const bScore = match.scores[match.playerB.id] ?? 0;

  const roundLabel = getRoundLabel(roundIndex, state.bracket!.totalRounds);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Round label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
        <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">
          {roundLabel}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
      </motion.div>

      {/* Combatant header */}
      <div className="flex items-center gap-6">
        {/* Player A */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 flex flex-col items-center gap-3"
        >
          <Avatar
            name={match.playerA.name}
            size={80}
            ring
            glow={aAnswered ? "cyan" : "none"}
          />
          <p className="text-lg font-black text-white text-center">
            {match.playerA.name}
          </p>
          <div className="text-2xl font-black text-amber-300">{aScore}</div>
          {aAnswered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-[10px] font-black text-emerald-300 uppercase tracking-widest"
            >
              Answered
            </motion.div>
          )}
        </motion.div>

        {/* Center: VS + timer */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 border border-cyan-500/20">
            <Swords size={24} className="text-cyan-400" />
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            VS
          </p>

          {/* Countdown ring */}
          <div className="relative flex items-center justify-center">
            <svg width="64" height="64" className="-rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={
                  timePct > 33
                    ? "#22d3ee"
                    : timePct > 15
                      ? "#f59e0b"
                      : "#ef4444"
                }
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - timePct / 100)}`}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.1s linear, stroke 0.3s",
                }}
              />
            </svg>
            <span className="absolute text-base font-black text-white">
              {Math.ceil(timeLeft / 1000)}
            </span>
          </div>
        </div>

        {/* Player B */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 flex flex-col items-center gap-3"
        >
          <Avatar
            name={match.playerB.name}
            size={80}
            ring
            glow={bAnswered ? "cyan" : "none"}
          />
          <p className="text-lg font-black text-white text-center">
            {match.playerB.name}
          </p>
          <div className="text-2xl font-black text-amber-300">{bScore}</div>
          {bAnswered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-[10px] font-black text-emerald-300 uppercase tracking-widest"
            >
              Answered
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-cyan-400/20 bg-slate-900/60 p-6"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-black mb-4">
          Question
        </p>
        <p className="text-2xl font-black text-white leading-snug mb-6">
          {q.prompt}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((option, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-700/60 text-sm font-black text-slate-300">
                {optionLetters[idx]}
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {option}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Question Result (between questions within a match) ─────────────────────
//
// Server sets phase: "question-result" after scoring any question that
// isn't the match's last one (see tournament:resolve-question). This is
// the screen the projector shows while the trainer reviews the answer on
// the Remote and decides when to advance — distinct from MatchResult,
// which only fires once the whole best-of-N match is decided.

function QuestionResult({ state }: { state: TournamentState }) {
  const match = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return null;
    for (const round of state.bracket.rounds) {
      const m = round.find((r) => r.id === state.currentMatchId);
      if (m) return m;
    }
    return null;
  }, [state]);

  if (!match || !state.currentQuestion) return null;

  const q = state.currentQuestion;
  const aScore = match.scores[match.playerA.id] ?? 0;
  const bScore = match.scores[match.playerB.id] ?? 0;
  const aLeading = aScore > bScore;
  const bLeading = bScore > aScore;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.5em] text-cyan-400 font-black mb-3">
          Question {q.questionNumber} of {q.totalQuestions} Scored
        </p>
        <h1 className="text-3xl font-black text-white">Next round incoming</h1>
      </motion.div>

      {/* Running score comparison */}
      <div className="flex w-full gap-4 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 rounded-2xl border p-4 text-center ${
            aLeading
              ? "border-emerald-400/30 bg-emerald-950/20"
              : "border-slate-700/30 bg-slate-900/30"
          }`}
        >
          <Avatar
            name={match.playerA.name}
            size={48}
            ring
            glow={aLeading ? "green" : "none"}
          />
          <p
            className={`mt-2 text-sm font-black ${aLeading ? "text-emerald-300" : "text-slate-300"}`}
          >
            {match.playerA.name}
          </p>
          <p className="text-3xl font-black text-amber-300">{aScore}</p>
        </motion.div>
        <div className="text-slate-500 font-black text-sm">vs</div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex-1 rounded-2xl border p-4 text-center ${
            bLeading
              ? "border-emerald-400/30 bg-emerald-950/20"
              : "border-slate-700/30 bg-slate-900/30"
          }`}
        >
          <Avatar
            name={match.playerB.name}
            size={48}
            ring
            glow={bLeading ? "green" : "none"}
          />
          <p
            className={`mt-2 text-sm font-black ${bLeading ? "text-emerald-300" : "text-slate-300"}`}
          >
            {match.playerB.name}
          </p>
          <p className="text-3xl font-black text-amber-300">{bScore}</p>
        </motion.div>
      </div>

      {/* Correct answer reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-950/10 p-4"
      >
        <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-2">
          Correct Answer
        </p>
        <p className="text-sm font-bold text-white">
          {optionLetters[q.correctIndex]}: {q.options[q.correctIndex]}
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: q.totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full ${
              i < q.questionNumber ? "bg-cyan-400" : "bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Match Result ─────────────────────────────────────────────────────────────

function MatchResult({ state }: { state: TournamentState }) {
  const match = useMemo(() => {
    if (!state.bracket || !state.currentMatchId) return null;
    for (const round of state.bracket.rounds) {
      const m = round.find((r) => r.id === state.currentMatchId);
      if (m) return m;
    }
    return null;
  }, [state]);

  if (!match || !state.currentQuestion) return null;

  const q = state.currentQuestion;
  const winner =
    match.winnerId === match.playerA.id ? match.playerA : match.playerB;
  const loser =
    match.winnerId === match.playerA.id ? match.playerB : match.playerA;
  // const aScore = match.scores[match.playerA.id] ?? 0;
  // const bScore = match.scores[match.playerB.id] ?? 0;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.5em] text-amber-400 font-black mb-4">
          Match Over
        </p>
        <Avatar name={winner.name} size={96} ring glow="amber" />
        <h1 className="mt-4 text-4xl font-black text-white">{winner.name}</h1>
        <p className="mt-2 text-amber-300 font-bold uppercase tracking-widest">
          Advances
        </p>
      </motion.div>

      {/* Score comparison */}
      <div className="flex w-full gap-4 items-center">
        <div className="flex-1 rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-4 text-center">
          <p className="text-xs text-emerald-300/60 font-bold uppercase tracking-wider">
            Winner
          </p>
          <p className="text-2xl font-black text-emerald-300 mt-1">
            {winner.name}
          </p>
          <p className="text-3xl font-black text-amber-300">
            {match.scores[winner.id] ?? 0}
          </p>
        </div>
        <div className="text-slate-500 font-black text-sm">vs</div>
        <div className="flex-1 rounded-2xl border border-slate-700/30 bg-slate-900/30 p-4 text-center opacity-60">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Eliminated
          </p>
          <p className="text-2xl font-black text-slate-400 mt-1">
            {loser.name}
          </p>
          <p className="text-3xl font-black text-slate-500">
            {match.scores[loser.id] ?? 0}
          </p>
        </div>
      </div>

      {/* Correct answer reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-950/10 p-4"
      >
        <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black mb-2">
          Correct Answer
        </p>
        <p className="text-sm font-bold text-white">
          {optionLetters[q.correctIndex]}: {q.options[q.correctIndex]}
        </p>
      </motion.div>
    </div>
  );
}

// ── Champion Scene ────────────────────────────────────────────────────────────

function ChampionScene({ state }: { state: TournamentState }) {
  const champion = state.participants.find((p) => p.id === state.championId);
  if (!champion) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8">
      {/* Particle burst — pure CSS rings */}
      <div className="relative flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3 + i * 0.4, opacity: 0 }}
            transition={{
              duration: 1.5 + i * 0.15,
              delay: i * 0.08,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="absolute h-24 w-24 rounded-full border border-amber-400/30"
            style={{
              borderColor:
                i % 2 === 0 ? "rgba(251,191,36,0.3)" : "rgba(34,211,238,0.2)",
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 1 }}
          className="relative"
        >
          <Avatar name={champion.name} size={128} ring glow="amber" />
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)]"
          >
            <Crown size={20} className="text-slate-950" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-xs uppercase tracking-[0.6em] text-amber-400 font-black mb-4"
        >
          [ TOURNAMENT_CHAMPION // SECURED ]
        </motion.p>
        <h1 className="text-7xl font-black uppercase text-white tracking-tight leading-none">
          {champion.name}
        </h1>
        <p className="mt-4 text-2xl font-bold text-amber-300 uppercase tracking-widest">
          Cyber Guardian
        </p>
      </motion.div>

      {/* Trophy row for all participants showing their bracket run */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-wrap justify-center gap-4 max-w-3xl"
      >
        {state.participants.map((p) => {
          const isChamp = p.id === state.championId;
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center gap-1.5 ${isChamp ? "" : "opacity-40"}`}
            >
              <Avatar
                name={p.name}
                size={40}
                glow={isChamp ? "amber" : "none"}
              />
              <p className="text-[10px] font-bold text-slate-400 text-center max-w-[56px] truncate">
                {p.name}
              </p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Main Tournament Scene ─────────────────────────────────────────────────────

export function TournamentScene({ state }: { state: TournamentState }) {
  const [revealProgress, setRevealProgress] = useState(0);

  // Animate bracket reveal column by column
  useEffect(() => {
    if (state.phase === "bracket-reveal") {
      setRevealProgress(0);
      const interval = setInterval(() => {
        setRevealProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            return 1;
          }
          return prev + 0.1;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [state.phase]);

  const { phase } = state;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center py-6">
      {/* IDLE / LOBBY — lobby = presenter clicked Enter Arena, Display shows this
           waiting screen while setup happens on the Remote */}
      <AnimatePresence mode="wait">
        {(phase === "idle" || phase === "lobby") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <Trophy size={56} className="mx-auto mb-6 text-amber-400" />
            </motion.div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500 font-black">
              [ ARENA_STANDING_BY ]
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase text-white">
              The Cyber Survival Tournament
            </h1>
            <p className="mt-6 text-slate-500 text-sm">
              Contestants — the trainer is setting up the bracket
            </p>
            <motion.p
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.5 }}
              className="mt-2 text-[11px] uppercase tracking-[0.4em] text-amber-400/60"
            >
              prepare yourself
            </motion.p>
          </motion.div>
        )}

        {/* SEEDING DRAW */}
        {phase === "seeding" && (
          <motion.div
            key="seeding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <SeedingReveal state={state} />
          </motion.div>
        )}

        {/* BRACKET REVEAL */}
        {phase === "bracket-reveal" && (
          <motion.div
            key="bracket-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <p className="text-center text-sm uppercase tracking-[0.4em] text-cyan-400 font-black mb-6">
              [ THE_BRACKET ]
            </p>
            <BracketDisplay state={state} revealProgress={revealProgress} />
          </motion.div>
        )}

        {/* MATCH ACTIVE */}
        {phase === "match-active" && (
          <motion.div
            key="match-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <MatchArena state={state} />
          </motion.div>
        )}

        {/* QUESTION RESULT (between questions within a match — server emits
             this after scoring any non-final question of the showdown) */}
        {phase === "question-result" && (
          <motion.div
            key="question-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <QuestionResult state={state} />
          </motion.div>
        )}

        {/* MATCH RESULT */}
        {phase === "match-result" && (
          <motion.div
            key="match-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <MatchResult state={state} />
          </motion.div>
        )}

        {/* BRACKET UPDATE (show updated bracket between rounds) */}
        {phase === "bracket-update" && (
          <motion.div
            key="bracket-update"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <p className="text-center text-sm uppercase tracking-[0.4em] text-amber-400 font-black mb-6 animate-pulse">
              [ ADVANCING_WINNERS ]
            </p>
            <BracketDisplay state={state} revealProgress={1} />
          </motion.div>
        )}

        {/* CHAMPION */}
        {phase === "champion" && (
          <motion.div
            key="champion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ChampionScene state={state} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
