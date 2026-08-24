export type AccuracyStatus = {
  label: string;
  barClass: string;
  textClass: string;
};

export const getAccuracyStatus = (accuracy: number): AccuracyStatus => {
  if (accuracy >= 80) {
    return { label: "Strong", barClass: "bg-success", textClass: "text-success" };
  }
  if (accuracy >= 55) {
    return { label: "Getting there", barClass: "bg-warning", textClass: "text-warning" };
  }
  return { label: "Needs practice", barClass: "bg-error", textClass: "text-error" };
};
