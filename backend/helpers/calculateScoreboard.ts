import { Room, Scoreboard } from "../types";

/**
 * Helper function for calculating the scoreboard of a given room.
 * @param room - The existing room in the game.
 * @returns The calculated scoreboard.
 */
export const calculateScoreboard = (room: Room): Scoreboard => {
  const { players } = room;
  const roomWords = [...room.words.values()];
  const scoreboard: Scoreboard = {};

  for (const eachPlayer of players) {
    if (eachPlayer.guesses !== undefined) {
      const numberCorrect = eachPlayer.guesses.filter(
        (eachPlayerGuess) => roomWords[eachPlayerGuess[1]] == eachPlayerGuess[0]
      ).length;
      const score =
        numberCorrect / (room.wordIndex === undefined ? 1 : room.wordIndex + 1);
      eachPlayer.score = Math.round(score * 100);

      scoreboard[eachPlayer.idNumber] = eachPlayer.score;
    }
  }

  return scoreboard;
};
