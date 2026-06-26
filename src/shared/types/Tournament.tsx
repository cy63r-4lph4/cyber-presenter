export type TournamentParticipant = {
  id: string;
  name: string;
};

export type TournamentMatch = {
  id: string;
  round: number;
  matchIndex: number;
  playerA: TournamentParticipant;
  playerB: TournamentParticipant;
  winnerId?: string;
  scores: Record<string, number>; // cumulative across all questions in this match
  questionIds: string[];          // IDs of questions assigned to this match
  questionsCompleted: number;     // how many of the 3 questions have been resolved
};

export type TournamentBracket = {
  rounds: TournamentMatch[][];
  totalRounds: number;
};

export type TournamentQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  questionNumber: number; // 1, 2, or 3 within the match
  totalQuestions: number; // always 3
};

export type TournamentAnswer = {
  participantId: string;
  questionId: string;
  optionIndex: number;
  answeredAt: number;
};

export type TournamentPhase =
  | "idle"       // server default, Display shows nothing tournament-related
  | "lobby"      // presenter activated arena — Display shows the idle arena screen
  | "seeding"    // bracket drawn, matchup cards animating in
  | "bracket-reveal"
  | "match-active"
  | "question-result"
  | "match-result"
  | "bracket-update"
  | "champion";

export type TournamentState = {
  phase: TournamentPhase;
  bracket: TournamentBracket | null;
  currentMatchId: string | null;
  lastCompletedMatchId: string | null;   // ← add this
  currentQuestion: TournamentQuestion | null;
  matchAnswers: TournamentAnswer[];
  allMatchAnswers: TournamentAnswer[];
  matchStartedAt: number | null;
  championId: string | null;
  participants: TournamentParticipant[];
  usedQuestionIds: string[];
};

export const TOURNAMENT_INITIAL_STATE: TournamentState = {
  phase: "idle",
  bracket: null,
  currentMatchId: null,
  lastCompletedMatchId: null,   // ← add this
  currentQuestion: null,
  matchAnswers: [],
  allMatchAnswers: [],
  matchStartedAt: null,
  championId: null,
  participants: [],
  usedQuestionIds: [],
};