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

  for (const eachPlayer of players) {
    if (eachPlayer.guesses !== undefined) {
      const numberCorrect = eachPlayer.guesses.filter(
        (eachPlayerGuess) => roomWords[eachPlayerGuess[1]] == eachPlayerGuess[0]
      ).length;

      const scoreDenominator =
        room.wordIndex === undefined ? 1 : room.wordIndex + customIncrement;
      const modifiedScoreDenominator =
        scoreDenominator - (scoreDenominator - eachPlayer.guesses.length);

      const score = numberCorrect / modifiedScoreDenominator;
      const safeScore = Number.isNaN(score) ? 0 : score;
      eachPlayer.score = Math.round(safeScore * 100);

      scoreboard[eachPlayer.idNumber] = eachPlayer.score;
    }
  }

  return scoreboard;
};
