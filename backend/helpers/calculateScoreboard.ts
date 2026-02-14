import { Room, Scoreboard } from "../types";

/**
 * Helper function for calculating the scoreboard of a given room.
 * @param room - The existing room in the game.
 * @param customIncrement - Custom increment for the `room.wordIndex + ?`
 * @returns The calculated scoreboard.
 */
export const calculateScoreboard = (
  room: Room,
  customIncrement: number = 1
): Scoreboard => {
  const { players } = room;
  const roomWords = [...room.words.values()];
  const scoreboard: Scoreboard = {};

  const totalWords = roomWords.length;

  // Build player results with score and tiebreaker (last round time for 100% ties)
  const playerResults: Array<{ id: number; score: number; tiebreaker: number; place?: number }> = players.map(player => {
    if (!player.guesses) return { id: player.idNumber, score: 0, tiebreaker: Infinity };
    const correctGuesses = player.guesses.filter(
      g => roomWords[g[1]]?.replace(/\s+/g, "") === g[0]?.replace(/\s+/g, "")
    );
    const score = Math.round((correctGuesses.length / totalWords) * 100);
    // Default tiebreaker: sum of correct guess times
    let tiebreaker = correctGuesses.reduce((sum, g) => sum + (g[2] || 0), 0);
    // If 100% correct, use the fastest correct guess time for the last word as tiebreaker
   if (score === 100 && totalWords > 0) {
  const lastCorrectTime = correctGuesses
    .filter(g => g[1] === totalWords - 1)
    .reduce((min, g) => g[2] && g[2] < min ? g[2] : min, Infinity);
  tiebreaker = lastCorrectTime;
  console.log('Player:', player.name, 'Last correct time:', lastCorrectTime, 'Guesses:', correctGuesses);
}
    return { id: player.idNumber, score, tiebreaker };
  });

  // Sort by score (desc), then tiebreaker (asc)
  playerResults.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tiebreaker - b.tiebreaker;
  });

  // Assign places
  let place = 1;
  for (let i = 0; i < playerResults.length; i++) {
    if (
      i > 0 &&
      playerResults[i].score === playerResults[i - 1].score &&
      playerResults[i].tiebreaker === playerResults[i - 1].tiebreaker
    ) {
      playerResults[i].place = playerResults[i - 1].place;
    } else {
      playerResults[i].place = place;
    }
    place++;
  }

  // Build scoreboard (score only, but you can also export place if needed)
  playerResults.forEach(res => {
    scoreboard[res.id] = res.score;
    // Optionally: scoreboard[res.id] = { score: res.score, place: res.place };
    const player = players.find(p => p.idNumber === res.id);
    if (player) player.score = res.score;
  });

  return scoreboard;
};
