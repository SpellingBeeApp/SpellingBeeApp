/**
 * @file Callback for mutating a player object, and re-formatting fields that are incompatible with JSON.stringify.
 */

import { Player } from "../types";

type ModifiedPlayer = Omit<Player, "guesses" | "roundGuesses"> & {
  guesses: Array<string>;
  roundGuesses: Array<number>;
};

/**
 * Takes in a player from the spelling bee game, and modifies it for JSON.stringify.
 * @param player - The player to modify for stringification.
 * @returns The modified player.
 */
const modifyPlayerForStringify = (player: Player): ModifiedPlayer => {
  const { guesses, roundGuesses, ...rest } = player;

  if (guesses !== undefined) {
    const convertedGuesses = [...guesses.values()];
    const convertedRoundGuesses = [...roundGuesses.values()];
    return {
      ...rest,
      guesses: convertedGuesses,
      roundGuesses: convertedRoundGuesses,
    };
  }

  return { ...rest, guesses: [], roundGuesses: [] };
};

export { modifyPlayerForStringify, type ModifiedPlayer };
