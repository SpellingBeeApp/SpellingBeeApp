/**
 * @file Represents the singular pill for each word in the room, scoped to the `HostRoom`.
 */

import { WordPillClickState } from "@/common/enum/WordPillClickState";
import React from "react";

type WordPillProperties = {
  /**
   * The index of the word.
   */
  readonly index: number;

  /**
   * The actual word in the room.
   */
  readonly word: string;
};

export const WordPill = ({
  index,
  word,
}: WordPillProperties): React.JSX.Element => {
  const onWordPillClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { target } = event;
      if (target !== undefined) {
        const mappedWordPill = target as HTMLDivElement;
        const nextWordButton = document.querySelector("#next_word_button_text");

        const { dataset } = mappedWordPill;
        const { status } = dataset;
        if (status !== undefined && nextWordButton !== null) {
          /** If clicking pill for first time. */
          if (status === WordPillClickState.NOT_SKIPPING.toString()) {
            mappedWordPill.dataset.status =
              WordPillClickState.POTENTIAL_SKIP.toString();

            nextWordButton.textContent = `Skip to "${mappedWordPill.textContent}"`;
            mappedWordPill.id = "selected_word_pill";
          } /** If clicking pill while already selected. */ else if (
            status === WordPillClickState.POTENTIAL_SKIP.toString()
          ) {
            mappedWordPill.dataset.status =
              WordPillClickState.NOT_SKIPPING.toString();
            nextWordButton.textContent = `Next Word`;
            mappedWordPill.id = "word_pill";
          }
        }
      }
    },
    []
  );

  const onWordPillBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const { relatedTarget, target } = event;
      if (target !== undefined) {
        const mappedWordPill = target as HTMLDivElement;
        const mappedRelatedTarget = relatedTarget as HTMLElement;
        const nextWordButtonText = document.querySelector(
          "#next_word_button_text"
        );

        if (nextWordButtonText !== null) {
          const mappedButton = nextWordButtonText as HTMLButtonElement;

          /** Clicking next word button. */
          if (
            mappedRelatedTarget !== null &&
            mappedRelatedTarget.id.startsWith("next_word_button")
          ) {
            mappedButton.textContent = "Next Word";
            return;
          }

          mappedWordPill.dataset.status =
            WordPillClickState.NOT_SKIPPING.toString();
        }
      }
    },
    []
  );

  return (
    <div
      className="badge bg-slate-500/50 font-semibold px-2 py-4 hover:cursor-pointer hover:bg-slate-500/75"
      data-status={WordPillClickState.NOT_SKIPPING}
      data-index={index}
      id="word_pill"
      onBlur={onWordPillBlur}
      onClick={onWordPillClick}
      tabIndex={-1}
    >
      {word}
    </div>
  );
};
