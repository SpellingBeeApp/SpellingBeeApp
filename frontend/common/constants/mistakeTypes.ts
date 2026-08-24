import { MistakeType } from "@/types/PracticeWord";

export const MISTAKE_TYPE_INFO: Record<MistakeType, { label: string }> = {
  "dropped-letter": { label: "Dropped a letter" },
  "extra-letter": { label: "Added an extra letter" },
  "swapped-letters": { label: "Swapped two letters" },
  "wrong-letter": { label: "Used the wrong letter" },
  other: { label: "Other" },
};
