/**
 * @file Callback for mutating a player object, and re-formatting fields that are incompatible with JSON.stringify.
 */

import { Player } from "../types";
import { Guess } from "../types/Guess";

type ModifiedPlayer = Omit<Player, "guesses" | "roundGuesses"> & {
  guesses: Array<Guess>;
  roundGuesses: Array<number>;
};

/**
 * Takes in a player from the spelling bee game, and modifies it by converting all fields of type `set` to their respective array equivalent.
 * @param player - The player to modify.
 * @returns The modified player.
 */
const convertPlayerSetsToArrays = (player: Player): ModifiedPlayer => {
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

export { convertPlayerSetsToArrays, type ModifiedPlayer };
