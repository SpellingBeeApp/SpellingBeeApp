import { SpellingPattern } from "@/types/PracticeWord";

export const SPELLING_PATTERN_INFO: Record<
  SpellingPattern,
  { label: string; tip: string }
> = {
  "schwa-vowel": {
    label: "Unstressed vowels",
    tip: "The tricky, unstressed vowel sound that could be spelled with almost any letter (like the \"a\" in separate). Sound it out syllable by syllable.",
  },
  "double-letters": {
    label: "Double letters",
    tip: "Words with a doubled consonant or vowel (like embarrass or accommodate). Say the word slowly and listen for where the sound \"lingers.\"",
  },
  "silent-letters": {
    label: "Silent letters",
    tip: "Letters that are written but not pronounced (like the \"gh\" in enough). These usually have to be memorized rather than sounded out.",
  },
  "tricky-suffix": {
    label: "Tricky suffixes",
    tip: "Endings like -able/-ible or -ance/-ence that sound almost identical. Learning the word's root can help you guess the right one.",
  },
  "foreign-spelling": {
    label: "Foreign spellings",
    tip: "Words borrowed from other languages that keep their original spelling (like rendezvous from French). Knowing the language of origin is the best clue.",
  },
  "vowel-team": {
    label: "Vowel combinations",
    tip: "Two or more vowels together making one sound (like \"ei\" in weird). Classic mnemonics like \"i before e\" only help sometimes.",
  },
};
