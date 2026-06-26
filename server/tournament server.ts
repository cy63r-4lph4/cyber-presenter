// ─────────────────────────────────────────────────────────────────────────────
// TOURNAMENT SERVER LOGIC — replace the tournament section in server/index.ts
//
// ADDITIONAL IMPORTS needed at top of server/index.ts:
//
//   import { QUESTION_BANK, pickRandomQuestions } from "../src/shared/data/questionBank";
//   import type {
//     TournamentState, TournamentParticipant, TournamentMatch,
//     TournamentBracket, TournamentQuestion, TournamentAnswer,
//   } from "../src/shared/types/Tournament";
//
// NOTE: The questionBank import is from the shared data file so the same
// question pool is available on both server and client (for the remote UI).
// ─────────────────────────────────────────────────────────────────────────────

import { QUESTION_BANK, pickRandomQuestions } from "../src/data/questionBank";
import type {
  TournamentState,
  TournamentParticipant,
  TournamentMatch,
  TournamentBracket,
  TournamentAnswer,
} from "../src/shared/types/Tournament";

// ── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS_PER_MATCH = 3;
const DEFAULT_TIME_LIMIT = 20; // seconds per question

// ── State ────────────────────────────────────────────────────────────────────

let tournament: TournamentState = {
  phase: "idle",
  bracket: null,
  currentMatchId: null,
  currentQuestion: null,
  matchAnswers: [],
  allMatchAnswers: [],
  matchStartedAt: null,
  championId: null,
  participants: [],
  usedQuestionIds: [],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBracket(participants: TournamentParticipant[]): TournamentBracket {
  const shuffled = shuffleArray(participants);

  let size = 1;
  while (size < shuffled.length) size *= 2;

  const padded: (TournamentParticipant | null)[] = [
    ...shuffled,
    ...Array(size - shuffled.length).fill(null),
  ];

  const firstRound: TournamentMatch[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    const a = padded[i];
    const b = padded[i + 1];
    if (!a) continue;

    // Pre-assign questions for this match upfront
    const assignedQs = pickRandomQuestions(QUESTIONS_PER_MATCH);
    const questionIds = assignedQs.map((q) => q.id);

    const match: TournamentMatch = {
      id: crypto.randomUUID(),
      round: 0,
      matchIndex: firstRound.length,
      playerA: a,
      playerB: b ?? { id: "bye", name: "BYE" },
      scores: {},
      questionIds,
      questionsCompleted: 0,
      winnerId: !b ? a.id : undefined,
    };
    firstRound.push(match);
  }

  return {
    rounds: [firstRound],
    totalRounds: Math.log2(size),
  };
}

function getCurrentMatch(t: TournamentState): TournamentMatch | null {
  if (!t.bracket || !t.currentMatchId) return null;
  for (const round of t.bracket.rounds) {
    for (const match of round) {
      if (match.id === t.currentMatchId) return match;
    }
  }
  return null;
}

/** Pick the next question for the current match based on questionsCompleted index. */
function buildNextQuestion(
  match: TournamentMatch,
  questionNumber: number,
  timeLimit: number,
): import("../src/shared/types/Tournament").TournamentQuestion | null {
  const questionId = match.questionIds[questionNumber - 1];
  if (!questionId) return null;

  const bankQ = QUESTION_BANK.find((q) => q.id === questionId);
  if (!bankQ) return null;

  return {
    id: bankQ.id,
    prompt: bankQ.prompt,
    options: [...bankQ.options],
    correctIndex: bankQ.correctIndex,
    timeLimit,
    questionNumber,
    totalQuestions: QUESTIONS_PER_MATCH,
  };
}

/** Score answers for a single question and merge into match cumulative scores. */
function scoreQuestion(
  match: TournamentMatch,
  answers: TournamentAnswer[],
  correctIndex: number,
  matchStartedAt: number,
  timeLimit: number,
): Record<string, number> {
  const timeLimitMs = timeLimit * 1000;
  const newScores: Record<string, number> = { ...match.scores };

  for (const answer of answers) {
    const isCorrect = answer.optionIndex === correctIndex;
    if (!isCorrect) {
      newScores[answer.participantId] = newScores[answer.participantId] ?? 0;
      continue;
    }
    const elapsed = answer.answeredAt - matchStartedAt;
    const speedBonus = Math.max(0, Math.round(500 * (1 - elapsed / timeLimitMs)));
    newScores[answer.participantId] = (newScores[answer.participantId] ?? 0) + 1000 + speedBonus;
  }

  return newScores;
}

function patchMatch(
  t: TournamentState,
  updatedMatch: TournamentMatch,
): TournamentState {
  const updatedRounds = t.bracket!.rounds.map((round) =>
    round.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)),
  );
  return { ...t, bracket: { ...t.bracket!, rounds: updatedRounds } };
}

function advanceBracket(t: TournamentState): TournamentState {
  if (!t.bracket) return t;

  const lastRound = t.bracket.rounds[t.bracket.rounds.length - 1];
  if (!lastRound.every((m) => m.winnerId)) return t;

  if (lastRound.length === 1) {
    return { ...t, phase: "champion", championId: lastRound[0].winnerId ?? null };
  }

  const winners: TournamentParticipant[] = lastRound.map((m) =>
    m.winnerId === m.playerA.id ? m.playerA : m.playerB,
  );

  const nextRound: TournamentMatch[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const assignedQs = pickRandomQuestions(QUESTIONS_PER_MATCH, {
      exclude: t.usedQuestionIds,
    });
    nextRound.push({
      id: crypto.randomUUID(),
      round: t.bracket.rounds.length,
      matchIndex: nextRound.length,
      playerA: winners[i],
      playerB: winners[i + 1],
      scores: {},
      questionIds: assignedQs.map((q) => q.id),
      questionsCompleted: 0,
    });
  }

  return {
    ...t,
    phase: "bracket-update",
    bracket: { ...t.bracket, rounds: [...t.bracket.rounds, nextRound] },
  };
}

// ── Socket handlers ───────────────────────────────────────────────────────────
// Paste all of these inside `io.on("connection", (socket) => { ... })`
// alongside your existing handlers.
//
// Also add this on the `connection` event (initial emit):
//   socket.emit("tournament:state", tournament);

export function registerTournamentHandlers(
  socket: import("socket.io").Socket,
  io: import("socket.io").Server,
) {
  socket.emit("tournament:state", tournament);

  // ── Init ──────────────────────────────────────────────────────────────────
  socket.on(
    "tournament:init",
    (participantList: { id: string; name: string }[]) => {
      const participants: TournamentParticipant[] = participantList.map((p) => ({
        id: p.id,
        name: p.name.trim().slice(0, 24) || "Guest",
      }));

      const bracket = buildBracket(participants);
      const allFirstRoundQIds = bracket.rounds[0].flatMap((m) => m.questionIds);

      tournament = {
        phase: "seeding",
        bracket,
        currentMatchId: null,
        currentQuestion: null,
        matchAnswers: [],
        allMatchAnswers: [],
        matchStartedAt: null,
        championId: null,
        participants,
        usedQuestionIds: allFirstRoundQIds,
      };

      io.emit("tournament:state", tournament);
    },
  );

  // ── Bracket reveal ────────────────────────────────────────────────────────
  socket.on("tournament:reveal-bracket", () => {
    tournament = { ...tournament, phase: "bracket-reveal" };
    io.emit("tournament:state", tournament);
  });

  // ── Start a match (first question) ───────────────────────────────────────
  socket.on(
    "tournament:start-match",
    (payload: { matchId: string; timeLimit?: number }) => {
      if (!tournament.bracket) return;

      const match = tournament.bracket.rounds
        .flatMap((r) => r)
        .find((m) => m.id === payload.matchId);
      if (!match) return;

      const timeLimit = payload.timeLimit ?? DEFAULT_TIME_LIMIT;
      const question = buildNextQuestion(match, 1, timeLimit);
      if (!question) return;

      tournament = {
        ...tournament,
        phase: "match-active",
        currentMatchId: payload.matchId,
        currentQuestion: question,
        matchAnswers: [],
        allMatchAnswers: [],
        matchStartedAt: Date.now(),
      };

      io.emit("tournament:state", tournament);

      setTimeout(() => {
        if (tournament.currentMatchId !== payload.matchId) return;
        if (tournament.phase !== "match-active") return;
        io.emit("tournament:time-up", { matchId: payload.matchId });
      }, question.timeLimit * 1000);
    },
  );

  // ── Submit answer ─────────────────────────────────────────────────────────
  socket.on(
    "tournament:answer",
    (payload: {
      participantId: string;
      questionId: string;
      optionIndex: number;
    }) => {
      if (
        tournament.phase !== "match-active" ||
        !tournament.currentQuestion ||
        tournament.currentQuestion.id !== payload.questionId
      ) return;

      if (tournament.matchAnswers.some((a) => a.participantId === payload.participantId)) return;

      const answer: TournamentAnswer = {
        participantId: payload.participantId,
        questionId: payload.questionId,
        optionIndex: payload.optionIndex,
        answeredAt: Date.now(),
      };

      tournament = {
        ...tournament,
        matchAnswers: [...tournament.matchAnswers, answer],
        allMatchAnswers: [...tournament.allMatchAnswers, answer],
      };

      io.emit("tournament:state", tournament);
    },
  );

  // ── Resolve current question ──────────────────────────────────────────────
  // Called by Remote after time expires or both players answered.
  // Scores the question, updates cumulative scores, moves to question-result
  // phase so the Display/Audience can show a brief inter-question reveal,
  // then the Remote calls tournament:next-question or tournament:resolve-match.
  socket.on("tournament:resolve-question", () => {
    const match = getCurrentMatch(tournament);
    if (!match || !tournament.currentQuestion || !tournament.matchStartedAt) return;

    const q = tournament.currentQuestion;

    const updatedScores = scoreQuestion(
      match,
      tournament.matchAnswers,
      q.correctIndex,
      tournament.matchStartedAt,
      q.timeLimit,
    );

    const updatedMatch: TournamentMatch = {
      ...match,
      scores: updatedScores,
      questionsCompleted: match.questionsCompleted + 1,
    };

    const isLastQuestion = updatedMatch.questionsCompleted >= QUESTIONS_PER_MATCH;

    // If last question, also determine winner
    if (isLastQuestion) {
      const aScore = updatedScores[match.playerA.id] ?? 0;
      const bScore = updatedScores[match.playerB.id] ?? 0;
      updatedMatch.winnerId = aScore >= bScore ? match.playerA.id : match.playerB.id;
    }

    tournament = patchMatch(
      {
        ...tournament,
        phase: isLastQuestion ? "match-result" : "question-result",
        currentQuestion: { ...q }, // keep visible for the result reveal
      },
      updatedMatch,
    );

    io.emit("tournament:state", tournament);
  });

  // ── Advance to next question within the same match ────────────────────────
  socket.on("tournament:next-question", (payload?: { timeLimit?: number }) => {
    const match = getCurrentMatch(tournament);
    if (!match) return;
    if (match.questionsCompleted >= QUESTIONS_PER_MATCH) return;

    const nextNumber = match.questionsCompleted + 1;
    const timeLimit = payload?.timeLimit ?? DEFAULT_TIME_LIMIT;
    const question = buildNextQuestion(match, nextNumber, timeLimit);
    if (!question) return;

    tournament = {
      ...tournament,
      phase: "match-active",
      currentQuestion: question,
      matchAnswers: [],
      matchStartedAt: Date.now(),
    };

    io.emit("tournament:state", tournament);

    setTimeout(() => {
      if (tournament.currentQuestion?.id !== question.id) return;
      if (tournament.phase !== "match-active") return;
      io.emit("tournament:time-up", { matchId: tournament.currentMatchId });
    }, question.timeLimit * 1000);
  });

  // ── Advance bracket after a full match is done ────────────────────────────
  socket.on("tournament:advance", () => {
    tournament = advanceBracket(tournament);

    // Track newly assigned question IDs to avoid reuse
    if (tournament.bracket) {
      const lastRound = tournament.bracket.rounds[tournament.bracket.rounds.length - 1];
      const newIds = lastRound.flatMap((m) => m.questionIds);
      tournament = {
        ...tournament,
        usedQuestionIds: [...tournament.usedQuestionIds, ...newIds],
      };
    }

    io.emit("tournament:state", tournament);
  });

  // ── Reset ─────────────────────────────────────────────────────────────────
  socket.on("tournament:reset", () => {
    tournament = {
      phase: "idle",
      bracket: null,
      currentMatchId: null,
      currentQuestion: null,
      matchAnswers: [],
      allMatchAnswers: [],
      matchStartedAt: null,
      championId: null,
      participants: [],
      usedQuestionIds: [],
    };
    io.emit("tournament:state", tournament);
  });
}