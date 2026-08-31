import { DashboardStats } from "@/helpers/dashboardStats";

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: string;
  isEarned: (stats: DashboardStats) => boolean;
};

export const BADGES: Badge[] = [
  {
    id: "first-steps",
    label: "First Steps",
    description: "Complete your first practice session",
    icon: "🌱",
    isEarned: (stats) => stats.sessionsCompleted >= 1,
  },
  {
    id: "on-a-roll",
    label: "On a Roll",
    description: "Practice 3 days in a row",
    icon: "🔥",
    isEarned: (stats) => stats.currentStreak >= 3,
  },
  {
    id: "word-master",
    label: "Word Master",
    description: "Master 10 words",
    icon: "⭐",
    isEarned: (stats) => stats.wordsMastered >= 10,
  },
  {
    id: "spelling-champ",
    label: "Spelling Champ",
    description: "Master 50 words",
    icon: "🏆",
    isEarned: (stats) => stats.wordsMastered >= 50,
  },
  {
    id: "sharpshooter",
    label: "Sharpshooter",
    description: "Reach 90% accuracy (20+ words practiced)",
    icon: "🎯",
    isEarned: (stats) => stats.totalAttempts >= 20 && (stats.overallAccuracy ?? 0) >= 90,
  },
  {
    id: "dedicated",
    label: "Dedicated",
    description: "Complete 10 practice sessions",
    icon: "📚",
    isEarned: (stats) => stats.sessionsCompleted >= 10,
  },
];
