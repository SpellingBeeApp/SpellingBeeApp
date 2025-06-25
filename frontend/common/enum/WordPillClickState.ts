export enum WordPillClickState {
  /**
   * The user has not clicked the word pill to attempt to skip to the word.
   */
  NOT_SKIPPING = 0,

  /**
   * The user is potentially trying to skip the word.
   */
  POTENTIAL_SKIP = 1,
}
