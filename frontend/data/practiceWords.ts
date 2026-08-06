import { PracticeWord } from "@/types/PracticeWord";

export const PRACTICE_LISTS: Record<
  string,
  { label: string; words: PracticeWord[] }
> = {
  grade3: {
    label: "Grade 3",
    words: [
      {
        word: "friend",
        definition: "A person you like and enjoy being with",
        partOfSpeech: "noun",
        sentence: "My closest friend helped me with my homework.",
      },
      {
        word: "because",
        definition: "For the reason that",
        partOfSpeech: "conjunction",
        sentence: "We stayed inside because it was raining.",
      },
      {
        word: "beautiful",
        definition: "Very pleasing to look at",
        partOfSpeech: "adjective",
        sentence: "The garden was full of beautiful flowers.",
      },
      {
        word: "enough",
        definition: "As much or as many as required",
        partOfSpeech: "adverb",
        sentence: "Do we have enough time to finish?",
      },
      {
        word: "people",
        definition: "Human beings in general",
        partOfSpeech: "noun",
        sentence: "Many people came to the school play.",
      },
    ],
  },
  grade5: {
    label: "Grade 5",
    words: [
      {
        word: "necessary",
        definition: "Required to be done or achieved",
        partOfSpeech: "adjective",
        sentence: "Sleep is necessary for good health.",
      },
      {
        word: "separate",
        definition: "Not joined or touching; to divide",
        partOfSpeech: "adjective",
        sentence: "Please separate the recyclables from the trash.",
      },
      {
        word: "accommodate",
        definition: "To provide lodging or sufficient space for",
        partOfSpeech: "verb",
        sentence: "The hotel can accommodate up to two hundred guests.",
      },
      {
        word: "rhythm",
        definition: "A strong, regular repeated pattern of sounds",
        partOfSpeech: "noun",
        sentence: "The drummer kept a steady rhythm throughout the song.",
      },
      {
        word: "occurrence",
        definition: "An instance of something happening",
        partOfSpeech: "noun",
        sentence: "Power outages are a rare occurrence in this town.",
      },
    ],
  },
  challenge: {
    label: "Challenge",
    words: [
      {
        word: "conscientious",
        definition: "Wishing to do what is right, especially at work",
        partOfSpeech: "adjective",
        sentence: "She is a conscientious student who always checks her work.",
      },
      {
        word: "pharaoh",
        definition: "A ruler in ancient Egypt",
        partOfSpeech: "noun",
        sentence: "The pharaoh ordered the construction of a great pyramid.",
      },
      {
        word: "mnemonic",
        definition: "A device such as a pattern of letters that aids memory",
        partOfSpeech: "noun",
        sentence: "ROY G. BIV is a mnemonic for the colors of the rainbow.",
      },
      {
        word: "chiaroscuro",
        definition: "The treatment of light and shade in drawing or painting",
        partOfSpeech: "noun",
        sentence: "The artist used chiaroscuro to create dramatic contrast in the painting.",
      },
      {
        word: "scherenschnitte",
        definition: "The art of cutting paper into decorative designs",
        partOfSpeech: "noun",
        sentence: "She learned the art of scherenschnitte from her grandmother.",
      },
    ],
  },
};
