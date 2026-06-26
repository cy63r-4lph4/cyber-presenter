// ── TOURNAMENT ─────────────────────────────────────────────────────────────
// Add these imports at the top of server/index.ts:
// import type { TournamentState, TournamentParticipant, TournamentMatch, TournamentBracket, TournamentQuestion, TournamentAnswer } from "../shared/types/tournament";
//
// Add this state near the other `let` declarations:

/*
let tournament: TournamentState = {
  phase: "idle",
  bracket: null,
  currentMatchId: null,
  currentQuestion: null,
  matchAnswers: [],
  matchStartedAt: null,
  championId: null,
  participants: [],
};
*/

// ── Tournament helpers ──────────────────────────────────────────────────────

// function shuffleArray<T>(arr: T[]): T[] {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// function buildBracket(participants: TournamentParticipant[]): TournamentBracket {
//   const shuffled = shuffleArray(participants);

//   // Pad to nearest power of 2 with byes (null participants get auto-advanced)
//   let size = 1;
//   while (size < shuffled.length) size *= 2;

//   const padded: (TournamentParticipant | null)[] = [
//     ...shuffled,
//     ...Array(size - shuffled.length).fill(null),
//   ];

//   const firstRound: TournamentMatch[] = [];
//   for (let i = 0; i < padded.length; i += 2) {
//     const a = padded[i];
//     const b = padded[i + 1];
//     if (!a) continue;

//     const match: TournamentMatch = {
//       id: crypto.randomUUID(),
//       round: 0,
//       matchIndex: firstRound.length,
//       playerA: a,
//       playerB: b || { id: "bye", name: "BYE" },
//       scores: {},
//       winnerId: !b ? a.id : undefined, // auto-advance bye
//     };
//     firstRound.push(match);
//   }

//   const totalRounds = Math.log2(size);

//   return {
//     rounds: [firstRound],
//     totalRounds,
//   };
// }

// function getCurrentMatch(state: TournamentState): TournamentMatch | null {
//   if (!state.bracket || !state.currentMatchId) return null;
//   for (const round of state.bracket.rounds) {
//     for (const match of round) {
//       if (match.id === state.currentMatchId) return match;
//     }
//   }
//   return null;
// }

// function advanceBracket(state: TournamentState): TournamentState {
//   if (!state.bracket) return state;

//   const lastRound = state.bracket.rounds[state.bracket.rounds.length - 1];
//   const allDone = lastRound.every((m) => m.winnerId);
//   if (!allDone) return state;

//   // Check if we have a champion (only 1 match in the round)
//   if (lastRound.length === 1) {
//     return {
//       ...state,
//       phase: "champion",
//       championId: lastRound[0].winnerId ?? null,
//     };
//   }

//   // Build next round from winners
//   const winners: TournamentParticipant[] = lastRound.map((m) => {
//     const p = m.winnerId === m.playerA.id ? m.playerA : m.playerB;
//     return p;
//   });

//   const nextRound: TournamentMatch[] = [];
//   for (let i = 0; i < winners.length; i += 2) {
//     nextRound.push({
//       id: crypto.randomUUID(),
//       round: state.bracket.rounds.length,
//       matchIndex: nextRound.length,
//       playerA: winners[i],
//       playerB: winners[i + 1],
//       scores: {},
//     });
//   }

//   return {
//     ...state,
//     phase: "bracket-update",
//     bracket: {
//       ...state.bracket,
//       rounds: [...state.bracket.rounds, nextRound],
//     },
//   };
// }

// ── Tournament socket handlers ──────────────────────────────────────────────
// Paste this block inside the io.on("connection", ...) handler:

/*
socket.emit("tournament:state", tournament);

socket.on("tournament:init", (participantList: { id: string; name: string }[]) => {
  const participants: TournamentParticipant[] = participantList.map((p) => ({
    id: p.id,
    name: normalizeName(p.name),
  }));

  const bracket = buildBracket(participants);

  tournament = {
    phase: "seeding",
    bracket,
    currentMatchId: null,
    currentQuestion: null,
    matchAnswers: [],
    matchStartedAt: null,
    championId: null,
    participants,
  };

  io.emit("tournament:state", tournament);
});

socket.on("tournament:reveal-bracket", () => {
  tournament = { ...tournament, phase: "bracket-reveal" };
  io.emit("tournament:state", tournament);
});

socket.on(
  "tournament:start-match",
  (payload: {
    matchId: string;
    question: { prompt: string; options: string[]; correctIndex: number; timeLimit: number };
  }) => {
    if (!tournament.bracket) return;

    const question: TournamentQuestion = {
      id: crypto.randomUUID(),
      prompt: payload.question.prompt.trim().slice(0, 240),
      options: payload.question.options.map((o) => o.trim().slice(0, 80)),
      correctIndex: payload.question.correctIndex,
      timeLimit: Math.max(10, Math.min(60, payload.question.timeLimit)),
    };

    tournament = {
      ...tournament,
      phase: "match-active",
      currentMatchId: payload.matchId,
      currentQuestion: question,
      matchAnswers: [],
      matchStartedAt: Date.now(),
    };

    io.emit("tournament:state", tournament);

    // Auto-close after timeLimit
    setTimeout(() => {
      if (tournament.currentMatchId !== payload.matchId) return;
      io.emit("tournament:time-up", { matchId: payload.matchId });
    }, question.timeLimit * 1000);
  },
);

socket.on(
  "tournament:answer",
  (payload: { participantId: string; questionId: string; optionIndex: number }) => {
    if (
      tournament.phase !== "match-active" ||
      !tournament.currentQuestion ||
      tournament.currentQuestion.id !== payload.questionId
    ) return;

    const alreadyAnswered = tournament.matchAnswers.some(
      (a) => a.participantId === payload.participantId,
    );
    if (alreadyAnswered) return;

    const answer: TournamentAnswer = {
      participantId: payload.participantId,
      questionId: payload.questionId,
      optionIndex: payload.optionIndex,
      answeredAt: Date.now(),
    };

    tournament = {
      ...tournament,
      matchAnswers: [...tournament.matchAnswers, answer],
    };

    io.emit("tournament:state", tournament);
  },
);

socket.on("tournament:resolve-match", () => {
  const match = getCurrentMatch(tournament);
  if (!match || !tournament.currentQuestion) return;

  const q = tournament.currentQuestion;
  const matchStart = tournament.matchStartedAt ?? Date.now();
  const timeLimit = q.timeLimit * 1000;

  // Score: 1000 pts for correct + up to 500 pts speed bonus
  const scores: Record<string, number> = {};

  for (const answer of tournament.matchAnswers) {
    const isCorrect = answer.optionIndex === q.correctIndex;
    if (!isCorrect) {
      scores[answer.participantId] = (scores[answer.participantId] ?? 0);
      continue;
    }
    const elapsed = answer.answeredAt - matchStart;
    const speedBonus = Math.max(0, Math.round(500 * (1 - elapsed / timeLimit)));
    scores[answer.participantId] = 1000 + speedBonus;
  }

  // Accrue into bracket match scores (across multiple questions if desired)
  const updatedMatch: TournamentMatch = {
    ...match,
    scores: {
      ...match.scores,
      ...Object.fromEntries(
        Object.entries(scores).map(([id, pts]) => [
          id,
          (match.scores[id] ?? 0) + pts,
        ]),
      ),
    },
  };

  // Determine winner
  const aScore = updatedMatch.scores[match.playerA.id] ?? 0;
  const bScore = updatedMatch.scores[match.playerB.id] ?? 0;
  const winnerId = aScore >= bScore ? match.playerA.id : match.playerB.id;
  updatedMatch.winnerId = winnerId;

  // Patch into bracket
  const updatedRounds = tournament.bracket!.rounds.map((round) =>
    round.map((m) => (m.id === match.id ? updatedMatch : m)),
  );

  tournament = {
    ...tournament,
    phase: "match-result",
    bracket: { ...tournament.bracket!, rounds: updatedRounds },
  };

  io.emit("tournament:state", tournament);
});

socket.on("tournament:advance", () => {
  tournament = advanceBracket(tournament);
  io.emit("tournament:state", tournament);
});

socket.on("tournament:reset", () => {
  tournament = {
    phase: "idle",
    bracket: null,
    currentMatchId: null,
    currentQuestion: null,
    matchAnswers: [],
    matchStartedAt: null,
    championId: null,
    participants: [],
  };
  io.emit("tournament:state", tournament);
});
*/

export {};