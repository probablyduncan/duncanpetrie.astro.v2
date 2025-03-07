
const motionReducedMatch = window.matchMedia("(prefers-reduced-motion: reduce)");
export const isMotionReduced = () => motionReducedMatch.matches;

export const isDarkMode = () => document.body.classList.contains("dark");