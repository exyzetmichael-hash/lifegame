/** XP required to go from level N to N+1. RPG-style curve, gentle early, steeper later. */
export function xpForLevel(level: number): number {
  return Math.round(80 * Math.pow(level, 1.45) + 40);
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let remaining = totalXp;
  let needed = xpForLevel(level);
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpForNext: needed };
}
