/**
 * Represents a player guess. [guess, round of guess, timestamp]
 * timestamp is a number (ms since epoch)
 */
/**
 * Represents a player guess. [guess, round of guess, timestamp, timeTaken]
 * timestamp is a number (ms since epoch)
 * timeTaken is number of seconds
 */
export type Guess = [string, number, number?, number?];
