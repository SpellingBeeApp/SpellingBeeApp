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
        sentence: "My closest companion helped me with my homework.",
      },
      {
        word: "because",
        definition: "For the reason that",
        partOfSpeech: "conjunction",
        sentence: "We stayed inside since it was raining.",
      },
      {
        word: "beautiful",
        definition: "Very pleasing to look at",
        partOfSpeech: "adjective",
        sentence: "The garden was full of lovely flowers.",
      },
      {
        word: "enough",
        definition: "As much or as many as required",
        partOfSpeech: "adverb",
        sentence: "Do we have sufficient time to finish?",
      },
      {
        word: "people",
        definition: "Human beings in general",
        partOfSpeech: "noun",
        sentence: "Many citizens came to the school play.",
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
        sentence: "Sleep is essential for good health.",
      },
      {
        word: "separate",
        definition: "Not joined or touching; to divide",
        partOfSpeech: "adjective",
        sentence: "Please sort the recyclables from the trash.",
      },
      {
        word: "accommodate",
        definition: "To provide lodging or sufficient space for",
        partOfSpeech: "verb",
        sentence: "The hotel can host up to two hundred guests.",
      },
      {
        word: "rhythm",
        definition: "A strong, regular repeated pattern of sounds",
        partOfSpeech: "noun",
        sentence: "The drummer kept a steady beat throughout the song.",
      },
      {
        word: "occurrence",
        definition: "An instance of something happening",
        partOfSpeech: "noun",
        sentence: "Power outages are a rare event in this town.",
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
        sentence: "She is a diligent student who always checks her work.",
      },
      {
        word: "pharaoh",
        definition: "A ruler in ancient Egypt",
        partOfSpeech: "noun",
        sentence: "The ancient ruler ordered the construction of a great pyramid.",
      },
      {
        word: "mnemonic",
        definition: "A device such as a pattern of letters that aids memory",
        partOfSpeech: "noun",
        sentence: "ROY G. BIV is a memory aid for the colors of the rainbow.",
      },
      {
        word: "chiaroscuro",
        definition: "The treatment of light and shade in drawing or painting",
        partOfSpeech: "noun",
        sentence: "The artist used light and shadow to create dramatic contrast.",
      },
      {
        word: "scherenschnitte",
        definition: "The art of cutting paper into decorative designs",
        partOfSpeech: "noun",
        sentence: "She learned the paper-cutting craft from her grandmother.",
      },
    ],
  },
};
