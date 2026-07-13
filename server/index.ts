import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import os from "os";
import crypto from "crypto";

import {
  type TournamentState,
  type TournamentParticipant,
  type TournamentMatch,
  type TournamentBracket,
  type TournamentAnswer,
  MATCH_COUNTDOWN_MS,
} from "../src/shared/types/Tournament";
import { QUESTION_BANK, pickRandomQuestions } from "../src/data/questionBank";

const app = express();
app.use(cors());

const server = http.createServer(app);

// ── Constants ─────────────────────────────────────────────────────────────────

const QUESTIONS_PER_MATCH = 3;
const DEFAULT_TIME_LIMIT = 20;

// ── Presentation types ────────────────────────────────────────────────────────

type PresentationState = {
  currentSlide: number;
  revealStep: number;
  sceneStep: number;
  mode: "presenting" | "demo" | "quiz" | "blackout" | "lobby";
};

type Participant = {
  id: string;
  name: string;
};

type LiveQuestion = {
  id: string;
  prompt: string;
  type: "short-text";
  isOpen: boolean;
};

type AudienceAnswer = {
  id: string;
  questionId: string;
  participantId: string;
  participantName: string;
  answer: string;
  category?: "strong" | "risky" | "discussion";
  visible: boolean;
  createdAt: number;
};

type AudienceQuestion = {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  status: "pending" | "answered" | "deferred";
  pinned: boolean;
  slideIndex: number;
  createdAt: number;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  isOpen: boolean;
  revealed: boolean;
};

type QuizVote = {
  id: string;
  quizId: string;
  participantId: string;
  participantName: string;
  optionIndex: number;
  createdAt: number;
};

type PhishCapture = {
  id: string;
  emailTyped: string;
  passwordEntered: boolean;
  capturedAt: number;
};

// ── Server state ──────────────────────────────────────────────────────────────

let joinedParticipants: Participant[] = [];
let phishCaptures: PhishCapture[] = [];
let activeQuestion: LiveQuestion | null = null;
let answers: AudienceAnswer[] = [];
let audienceQuestions: AudienceQuestion[] = [];
let activeQuiz: QuizQuestion | null = null;
let quizVotes: QuizVote[] = [];

let state: PresentationState = {
  currentSlide: 0,
  revealStep: 0,
  sceneStep: 0,
  mode: "presenting",
};

let tournament: TournamentState = {
  phase: "idle",
  bracket: null,
  currentMatchId: null,
  lastCompletedMatchId: null,
  currentQuestion: null,
  matchAnswers: [],
  allMatchAnswers: [],
  matchStartedAt: null,
  championId: null,
  participants: [],
  usedQuestionIds: [],
};
// ── Socket.IO ─────────────────────────────────────────────────────────────────

const io = new Server(server, {
  cors: { origin: "*" },
});

// ── Utility helpers ───────────────────────────────────────────────────────────

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 24) || "Guest";
}

function normalizeAnswer(answer: string) {
  return answer.trim().replace(/\s+/g, " ").slice(0, 280);
}

function normalizeOption(option: string) {
  return option.trim().replace(/\s+/g, " ").slice(0, 80);
}

// ── Tournament helpers ────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBracket(
  participants: TournamentParticipant[],
): TournamentBracket {
  const shuffled = shuffleArray(participants);
  const n = shuffled.length;

  let size = 1;
  while (size < n) size *= 2;

  const numMatches = size / 2;
  const numByes = size - n;
  const firstRound: TournamentMatch[] = [];
  let playerIdx = 0;
  const usedSoFar: string[] = []; // avoids overlapping question sets within round 1

  for (let i = 0; i < numMatches; i++) {
    const a = shuffled[playerIdx++];
    const isByeMatch = i < numByes;
    const b = isByeMatch ? null : shuffled[playerIdx++];

    // Bye matches are decided instantly and never actually played — don't
    // spend question inventory on them.
    let questionIds: string[] = [];
    if (!isByeMatch) {
      const assignedQs = pickRandomQuestions(QUESTIONS_PER_MATCH, {
        exclude: usedSoFar,
      });
      questionIds = assignedQs.map((q) => q.id);
      usedSoFar.push(...questionIds);
    }

    firstRound.push({
      id: crypto.randomUUID(),
      round: 0,
      matchIndex: firstRound.length,
      playerA: a,
      playerB: b ?? { id: "bye", name: "BYE" },
      scores: {},
      questionIds,
      questionsCompleted: 0,
      winnerId: !b ? a.id : undefined,
    });
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

function buildNextQuestion(
  match: TournamentMatch,
  questionNumber: number,
  timeLimit: number,
): TournamentState["currentQuestion"] {
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

function scoreQuestion(
  match: TournamentMatch,
  matchAnswers: TournamentAnswer[],
  correctIndex: number,
  matchStartedAt: number,
  timeLimit: number,
): Record<string, number> {
  const timeLimitMs = timeLimit * 1000;
  const newScores: Record<string, number> = { ...match.scores };

  for (const answer of matchAnswers) {
    const isCorrect = answer.optionIndex === correctIndex;
    if (!isCorrect) {
      newScores[answer.participantId] = newScores[answer.participantId] ?? 0;
      continue;
    }
    const elapsed = answer.answeredAt - matchStartedAt;
    const speedBonus = Math.max(
      0,
      Math.round(500 * (1 - elapsed / timeLimitMs)),
    );
    newScores[answer.participantId] =
      (newScores[answer.participantId] ?? 0) + 1000 + speedBonus;
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

  // The match that triggered this advance call — i.e. the one that just
  // completed the round. Captured before we touch currentMatchId so the
  // Display can animate this exact winner flying up into its new slot.
  const justFinishedMatchId = t.currentMatchId;

  // Only one match in the round means the tournament is over
  if (lastRound.length === 1) {
    return {
      ...t,
      phase: "champion",
      championId: lastRound[0].winnerId ?? null,
      lastCompletedMatchId: justFinishedMatchId,
    };
  }

  const winners: TournamentParticipant[] = lastRound.map((m) =>
    m.winnerId === m.playerA.id ? m.playerA : m.playerB,
  );

  const nextRound: TournamentMatch[] = [];
  const usedThisRound: string[] = [];
  for (let i = 0; i < winners.length; i += 2) {
    const assignedQs = pickRandomQuestions(QUESTIONS_PER_MATCH, {
      exclude: [...t.usedQuestionIds, ...usedThisRound],
    });
    const ids = assignedQs.map((q) => q.id);
    usedThisRound.push(...ids);
    nextRound.push({
      id: crypto.randomUUID(),
      round: t.bracket.rounds.length,
      matchIndex: nextRound.length,
      playerA: winners[i],
      playerB: winners[i + 1],
      scores: {},
      questionIds: ids,
      questionsCompleted: 0,
    });
  }

  const newState: TournamentState = {
    ...t,
    phase: "bracket-update",
    bracket: { ...t.bracket, rounds: [...t.bracket.rounds, nextRound] },
    lastCompletedMatchId: justFinishedMatchId,
  };

  // Track the newly assigned IDs so they aren't reused in later rounds
  const newIds = nextRound.flatMap((m) => m.questionIds);
  return { ...newState, usedQuestionIds: [...t.usedQuestionIds, ...newIds] };
}

// ── Connection handler ────────────────────────────────────────────────────────

io.on("connection", (socket) => {
  // ── Initial state sync ──────────────────────────────────────────────────
  socket.emit("state:update", state);
  socket.emit("question:update", activeQuestion);
  socket.emit("answers:update", answers);
  socket.emit("audience-questions:update", audienceQuestions);
  socket.emit("quiz:update", activeQuiz);
  socket.emit("quiz-votes:update", quizVotes);
  socket.emit("phish-captures:update", phishCaptures);
  socket.emit("participants:update", joinedParticipants);
  // Emitted last so the client has all other state before it triggers UI transitions
  socket.emit("tournament:state", tournament);
  socket.on("tournament:scroll", (payload) => {
    socket.broadcast.emit("tournament:scroll", payload);
  });

  // ── Scene video relay ───────────────────────────────────────────────────
  socket.on("scene:video", (payload) => {
    io.emit("scene:video", payload);
  });

  // ── Presentation remote commands ────────────────────────────────────────
  socket.on("remote:command", (command: string) => {
    io.emit("presentation:command", command);

    if (command.startsWith("goto:")) {
      const index = Number(command.split(":")[1]);
      if (!Number.isNaN(index)) {
        state.currentSlide = Math.max(0, index);
        state.revealStep = 0;
        state.sceneStep = 0;
        state.mode = "presenting";
      }
      io.emit("state:update", state);
      return;
    }

    if (command === "next") {
      state.currentSlide += 1;
      state.revealStep = 0;
      state.sceneStep = 0;
      state.mode = "presenting";
    }

    if (command === "prev") {
      state.currentSlide = Math.max(0, state.currentSlide - 1);
      state.revealStep = 0;
      state.sceneStep = 0;
      state.mode = "presenting";
    }

    if (command === "reveal") {
      state.revealStep += 1;
    }

    if (command === "blackout") {
      state.mode = state.mode === "blackout" ? "presenting" : "blackout";
    }

    if (command === "lobby") {
      state.mode = state.mode === "lobby" ? "presenting" : "lobby";
    }

    if (command === "reset") {
      state = {
        currentSlide: 0,
        revealStep: 0,
        sceneStep: 0,
        mode: "presenting",
      };
    }

    io.emit("state:update", state);
  });

  socket.on("scene:step", (step: number) => {
    if (!Number.isInteger(step) || step < 0) return;
    state.sceneStep = step;
    io.emit("state:update", state);
  });

  // ── Participants ────────────────────────────────────────────────────────
  socket.on("audience:join", (name: string) => {
    const participant: Participant = {
      id: crypto.randomUUID(),
      name: normalizeName(name),
    };

    // Deduplicate by name
    if (!joinedParticipants.some((p) => p.name === participant.name)) {
      joinedParticipants.push(participant);
    }

    socket.emit("audience:joined", participant);
    io.emit("participants:update", joinedParticipants);
  });

  socket.on("participants:request", () => {
    socket.emit("participants:update", joinedParticipants);
  });

  // ── Live question ───────────────────────────────────────────────────────
  socket.on("question:activate", (question: Partial<LiveQuestion>) => {
    const prompt = question.prompt?.trim().slice(0, 240);
    if (!prompt) return;

    activeQuestion = {
      id: question.id || crypto.randomUUID(),
      prompt,
      type: "short-text",
      isOpen: true,
    };
    answers = [];

    io.emit("question:update", activeQuestion);
    io.emit("answers:update", answers);
  });

  socket.on("question:close", () => {
    if (activeQuestion) activeQuestion.isOpen = false;
    io.emit("question:update", activeQuestion);
  });

  socket.on(
    "answer:submit",
    (payload: {
      questionId: string;
      participantId: string;
      participantName: string;
      answer: string;
    }) => {
      if (!activeQuestion || !activeQuestion.isOpen) return;
      if (payload.questionId !== activeQuestion.id) return;

      const cleanAnswer = normalizeAnswer(payload.answer);
      if (!cleanAnswer) return;

      const newAnswer: AudienceAnswer = {
        id: crypto.randomUUID(),
        questionId: payload.questionId,
        participantId: payload.participantId,
        participantName: normalizeName(payload.participantName),
        answer: cleanAnswer,
        visible: false,
        createdAt: Date.now(),
      };

      answers.unshift(newAnswer);
      io.emit("answers:update", answers);
    },
  );

  socket.on(
    "answer:update",
    (payload: {
      answerId: string;
      category?: "strong" | "risky" | "discussion";
      visible?: boolean;
    }) => {
      answers = answers.map((answer) => {
        if (answer.id !== payload.answerId) return answer;
        return {
          ...answer,
          category: payload.category ?? answer.category,
          visible:
            typeof payload.visible === "boolean"
              ? payload.visible
              : answer.visible,
        };
      });
      io.emit("answers:update", answers);
    },
  );

  socket.on("answers:clear", () => {
    answers = [];
    io.emit("answers:update", answers);
  });

  // ── Phishing demo ───────────────────────────────────────────────────────
  socket.on(
    "phish:capture",
    (payload: { emailTyped: string; passwordEntered: boolean }) => {
      const emailTyped = (payload.emailTyped ?? "").trim().slice(0, 120);
      if (!emailTyped) return;

      phishCaptures.push({
        id: crypto.randomUUID(),
        emailTyped,
        passwordEntered: Boolean(payload.passwordEntered),
        capturedAt: Date.now(),
      });

      io.emit("phish-captures:update", phishCaptures);
    },
  );

  socket.on("phish:reset", () => {
    phishCaptures = [];
    io.emit("phish-captures:update", phishCaptures);
  });

  // ── Audience questions ──────────────────────────────────────────────────
  socket.on(
    "audience-question:submit",
    (payload: {
      participantId: string;
      participantName: string;
      text: string;
      slideIndex: number;
    }) => {
      const text = payload.text?.trim().slice(0, 280);
      if (!text) return;

      const newQ: AudienceQuestion = {
        id: crypto.randomUUID(),
        participantId: payload.participantId,
        participantName: normalizeName(payload.participantName),
        text,
        status: "pending",
        pinned: false,
        slideIndex: payload.slideIndex ?? 0,
        createdAt: Date.now(),
      };

      audienceQuestions.unshift(newQ);
      io.emit("audience-questions:update", audienceQuestions);
    },
  );

  socket.on(
    "audience-question:update",
    (payload: {
      questionId: string;
      status?: "pending" | "answered" | "deferred";
      pinned?: boolean;
    }) => {
      if (payload.pinned === true) {
        audienceQuestions = audienceQuestions.map((q) => ({
          ...q,
          pinned: false,
        }));
      }

      audienceQuestions = audienceQuestions.map((q) => {
        if (q.id !== payload.questionId) return q;
        return {
          ...q,
          status: payload.status ?? q.status,
          pinned:
            typeof payload.pinned === "boolean" ? payload.pinned : q.pinned,
        };
      });

      io.emit("audience-questions:update", audienceQuestions);
    },
  );

  socket.on("audience-questions:clear", () => {
    audienceQuestions = [];
    io.emit("audience-questions:update", audienceQuestions);
  });

  // ── Quiz ────────────────────────────────────────────────────────────────
  socket.on(
    "quiz:activate",
    (payload: { prompt: string; options: string[]; correctIndex: number }) => {
      const prompt = payload.prompt?.trim().slice(0, 240);
      const options = (payload.options ?? [])
        .map(normalizeOption)
        .filter((o) => o.length > 0)
        .slice(0, 4);

      if (!prompt || options.length < 2) return;

      const correctIndex =
        Number.isInteger(payload.correctIndex) &&
        payload.correctIndex >= 0 &&
        payload.correctIndex < options.length
          ? payload.correctIndex
          : 0;

      activeQuiz = {
        id: crypto.randomUUID(),
        prompt,
        options,
        correctIndex,
        isOpen: true,
        revealed: false,
      };
      quizVotes = [];

      io.emit("quiz:update", activeQuiz);
      io.emit("quiz-votes:update", quizVotes);
    },
  );

  socket.on(
    "quiz:vote",
    (payload: {
      quizId: string;
      participantId: string;
      participantName: string;
      optionIndex: number;
    }) => {
      if (!activeQuiz || !activeQuiz.isOpen) return;
      if (payload.quizId !== activeQuiz.id) return;
      if (
        !Number.isInteger(payload.optionIndex) ||
        payload.optionIndex < 0 ||
        payload.optionIndex >= activeQuiz.options.length
      )
        return;

      const existingIndex = quizVotes.findIndex(
        (v) =>
          v.quizId === payload.quizId &&
          v.participantId === payload.participantId,
      );

      const vote: QuizVote = {
        id:
          existingIndex >= 0
            ? quizVotes[existingIndex].id
            : crypto.randomUUID(),
        quizId: payload.quizId,
        participantId: payload.participantId,
        participantName: normalizeName(payload.participantName),
        optionIndex: payload.optionIndex,
        createdAt: Date.now(),
      };

      if (existingIndex >= 0) {
        quizVotes[existingIndex] = vote;
      } else {
        quizVotes.push(vote);
      }

      io.emit("quiz-votes:update", quizVotes);
    },
  );

  socket.on("quiz:close", () => {
    if (activeQuiz) activeQuiz.isOpen = false;
    io.emit("quiz:update", activeQuiz);
  });

  socket.on("quiz:reveal", () => {
    if (activeQuiz) {
      activeQuiz.isOpen = false;
      activeQuiz.revealed = true;
    }
    io.emit("quiz:update", activeQuiz);
  });

  socket.on("quiz:clear", () => {
    activeQuiz = null;
    quizVotes = [];
    io.emit("quiz:update", activeQuiz);
    io.emit("quiz-votes:update", quizVotes);
  });

  // ── Tournament ──────────────────────────────────────────────────────────

  // ── Enter arena lobby (shows idle arena screen on Display before setup) ──
  socket.on("tournament:lobby", () => {
    tournament = { ...tournament, phase: "lobby" };
    io.emit("tournament:state", tournament);
  });

  socket.on(
    "tournament:init",
    (participantList: { id: string; name: string }[]) => {
      const participants: TournamentParticipant[] = participantList.map(
        (p) => ({
          id: p.id,
          name: normalizeName(p.name),
        }),
      );

      const bracket = buildBracket(participants);
      const allFirstRoundQIds = bracket.rounds[0].flatMap((m) => m.questionIds);

      tournament = {
        phase: "seeding",
        bracket,
        currentMatchId: null,
        lastCompletedMatchId: null,
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

  socket.on("tournament:reveal-bracket", () => {
    tournament = { ...tournament, phase: "bracket-reveal" };
    io.emit("tournament:state", tournament);
  });

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

      const matchStartedAt = Date.now() + MATCH_COUNTDOWN_MS;
      console.log(
        `Tournament match ${payload.matchId} started @ ${new Date(matchStartedAt).toLocaleTimeString()}`,
      );
      console.log(
        `Showdown Ends @ ${new Date(matchStartedAt + question.timeLimit * 1000).toLocaleTimeString()}`,
      );

      tournament = {
        ...tournament,
        phase: "match-active",
        currentMatchId: payload.matchId,
        lastCompletedMatchId: null,
        currentQuestion: question,
        matchAnswers: [],
        allMatchAnswers: [],
        matchStartedAt,
      };

      io.emit("tournament:state", tournament);

      const matchId = payload.matchId;
      // Delay off matchStartedAt (not Date.now()) so the real answer window
      // always matches what the countdown ring promises on screen, even if
      // there's any delay between this handler running and now.
      const delay = matchStartedAt + question.timeLimit * 1000 - Date.now();
      setTimeout(() => {
        if (tournament.currentMatchId !== matchId) return;
        if (tournament.phase !== "match-active") return;
        io.emit("tournament:time-up", { matchId });
      }, delay);
    },
  );

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
        tournament.currentQuestion.id !== payload.questionId ||
        !tournament.matchStartedAt ||
        Date.now() < tournament.matchStartedAt
      )
        return;

      if (
        tournament.matchAnswers.some(
          (a) => a.participantId === payload.participantId,
        )
      )
        return;

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

  socket.on("tournament:resolve-question", () => {
    const match = getCurrentMatch(tournament);
    if (!match || !tournament.currentQuestion || !tournament.matchStartedAt)
      return;

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

    const isLastQuestion =
      updatedMatch.questionsCompleted >= QUESTIONS_PER_MATCH;

    if (isLastQuestion) {
      const aScore = updatedScores[match.playerA.id] ?? 0;
      const bScore = updatedScores[match.playerB.id] ?? 0;
      updatedMatch.winnerId =
        aScore >= bScore ? match.playerA.id : match.playerB.id;
    }

    tournament = patchMatch(
      {
        ...tournament,
        phase: isLastQuestion ? "match-result" : "question-result",
        currentQuestion: { ...q },
      },
      updatedMatch,
    );

    io.emit("tournament:state", tournament);
  });

  socket.on("tournament:next-question", (payload?: { timeLimit?: number }) => {
    const match = getCurrentMatch(tournament);
    if (!match) return;
    if (match.questionsCompleted >= QUESTIONS_PER_MATCH) return;

    const nextNumber = match.questionsCompleted + 1;
    const timeLimit = payload?.timeLimit ?? DEFAULT_TIME_LIMIT;
    const question = buildNextQuestion(match, nextNumber, timeLimit);
    if (!question) return;
    const matchStartedAt = Date.now() + MATCH_COUNTDOWN_MS;
    tournament = {
      ...tournament,
      phase: "match-active",
      currentQuestion: question,
      matchAnswers: [],
      matchStartedAt: matchStartedAt,
    };

    io.emit("tournament:state", tournament);

    const questionId = question.id;
    const delay = matchStartedAt + question.timeLimit * 1000 - Date.now();
    setTimeout(() => {
      if (tournament.currentQuestion?.id !== questionId) return;
      if (tournament.phase !== "match-active") return;
      io.emit("tournament:time-up", { matchId: tournament.currentMatchId });
    }, delay);
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
      lastCompletedMatchId: null,
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

  // State-request for clients that need a resync (e.g. after reconnect)
  socket.on("tournament:state-request", () => {
    socket.emit("tournament:state", tournament);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────

const PORT = 4000;

server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIp();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Display:  http://${ip}:5173`);
  console.log(`Remote:   http://${ip}:5173/remote`);
  console.log(`Audience: http://${ip}:5173/audience`);
});
