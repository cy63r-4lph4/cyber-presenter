const accentGradients = [
  "from-cyan-300 via-blue-400 to-purple-500",
  "from-rose-300 via-orange-400 to-yellow-300",
  "from-emerald-300 via-cyan-400 to-blue-400",
  "from-purple-300 via-fuchsia-400 to-rose-400",
];

/** Cycles the shared accent palette by slide index. One array, one place. */
export function getAccentGradient(slideIndex: number): string {
  return accentGradients[slideIndex % accentGradients.length];
}