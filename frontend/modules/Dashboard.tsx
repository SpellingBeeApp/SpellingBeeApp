"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";
import { loadPracticeProgress, MASTERY_STREAK } from "@/helpers/practiceProgress";
import { computeDashboardStats, DashboardStats } from "@/helpers/dashboardStats";
import { getAccuracyStatus } from "@/helpers/accuracyStatus";
import { SPELLING_PATTERN_INFO } from "@/common/constants/spellingPatterns";
import { MISTAKE_TYPE_INFO } from "@/common/constants/mistakeTypes";
import { BADGES } from "@/common/constants/badges";

export default function Dashboard() {
  // Practice history only exists in localStorage, which isn't available
  // during server rendering — load it after mount so the server-rendered
  // HTML and the first client render match (avoids a hydration mismatch).
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    setStats(computeDashboardStats(loadPracticeProgress()));
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen honeycomb-bg flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const maxMistakeCount = Math.max(
    1,
    ...stats.mistakeTypeStats.map((s) => s.count),
  );

  return (
    <div className="min-h-screen honeycomb-bg pt-safe pb-safe p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="btn btn-ghost btn-sm rounded-full">
            ← Home
          </Link>
          <Link href="/practice" className="btn btn-primary btn-sm rounded-full">
            Practice Quiz
          </Link>
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          <Image
            alt="Scripps Spelling Bee Logo"
            src="/sb003.png"
            width={200}
            height={140}
            className="w-32 h-auto"
          />
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Your Spelling Dashboard
          </h1>
          <p className="text-base-content/70 max-w-md">
            Your strengths, weaknesses, and most-missed words — all based on
            your own practice history.
          </p>
        </div>

        {stats.totalAttempts === 0 ? (
          <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
            <div className="card-body items-center text-center p-8 space-y-4">
              <Sparkles className="h-10 w-10 text-secondary" />
              <p className="text-lg font-medium">
                No stats yet — practice a few words first!
              </p>
              <p className="text-base-content/60">
                Your dashboard fills in automatically as you complete Practice
                Quiz sessions.
              </p>
              <Link href="/practice" className="btn btn-primary rounded-full">
                Start Practicing
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="stats stats-vertical sm:stats-horizontal w-full shadow bg-primary/10 rounded-2xl">
              <div className="stat">
                <div className="stat-title text-center">Words Practiced</div>
                <div className="stat-value text-center text-primary">
                  {stats.totalAttempts}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-center">Accuracy</div>
                <div className="stat-value text-center text-primary">
                  {stats.overallAccuracy}%
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-center">Sessions</div>
                <div className="stat-value text-center text-primary">
                  {stats.sessionsCompleted}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-center">Words Mastered</div>
                <div className="stat-value text-center text-primary">
                  {stats.wordsMastered}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-center">Day Streak</div>
                <div className="stat-value text-center text-primary">
                  {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : 0}
                </div>
              </div>
            </div>

            {stats.patternStats.length > 0 && (
              <div className="card card-modern rounded-3xl bg-primary text-primary-content shadow-xl">
                <div className="card-body p-5 sm:p-6 space-y-3">
                  <h2 className="card-title">🎯 Your Focus Area</h2>
                  <p className="text-sm opacity-90">
                    {SPELLING_PATTERN_INFO[stats.patternStats[0].pattern].label} is
                    where you have the most to gain — {stats.patternStats[0].accuracy}%
                    accuracy so far.
                  </p>
                  <p className="text-sm opacity-80">
                    {SPELLING_PATTERN_INFO[stats.patternStats[0].pattern].tip}
                  </p>
                  <Link
                    href={`/practice?pattern=${stats.patternStats[0].pattern}`}
                    className="btn btn-secondary rounded-full w-full sm:w-fit"
                  >
                    Practice This Now →
                  </Link>
                </div>
              </div>
            )}

            <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
              <div className="card-body p-5 sm:p-6 space-y-4">
                <h2 className="card-title">Strengths &amp; Weaknesses</h2>
                {stats.patternStats.length === 0 ? (
                  <p className="text-base-content/60 text-sm">
                    Keep practicing — once you've tried a few words in a
                    category, your accuracy for it will show up here.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.patternStats.map(({ pattern, accuracy }) => {
                      const info = SPELLING_PATTERN_INFO[pattern];
                      const status = getAccuracyStatus(accuracy);
                      return (
                        <div key={pattern} className="space-y-1">
                          <div className="flex justify-between items-center text-sm gap-2">
                            <span className="font-medium">{info.label}</span>
                            <span className={`font-semibold whitespace-nowrap ${status.textClass}`}>
                              {accuracy}% · {status.label}
                            </span>
                          </div>
                          <div className="h-3 bg-base-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status.barClass}`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                          <p className="text-xs text-base-content/50">{info.tip}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
              <div className="card-body p-5 sm:p-6 space-y-4">
                <h2 className="card-title">How You Tend to Miss Words</h2>
                {stats.mistakeTypeStats.length === 0 ? (
                  <p className="text-base-content/60 text-sm">
                    No mistakes logged yet — nice work!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.mistakeTypeStats.map(({ mistakeType, count }) => (
                      <div key={mistakeType} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">
                            {MISTAKE_TYPE_INFO[mistakeType].label}
                          </span>
                          <span className="text-base-content/60">{count}x</span>
                        </div>
                        <div className="h-3 bg-base-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-secondary"
                            style={{
                              width: `${(count / maxMistakeCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
              <div className="card-body p-5 sm:p-6 space-y-4">
                <h2 className="card-title">Words to Keep Practicing</h2>
                {stats.mostMissedWords.length === 0 ? (
                  <p className="text-base-content/60 text-sm">
                    You're all caught up — no words currently need review! 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.mostMissedWords.map(({ word, count, correctStreak }) => (
                      <div
                        key={word}
                        className="flex justify-between items-center p-3 bg-base-200 rounded-xl gap-2"
                      >
                        <span className="font-medium">{word}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-base-content/60 whitespace-nowrap">
                            missed {count}x
                          </span>
                          <div className="flex gap-1">
                            {Array.from({ length: MASTERY_STREAK }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < correctStreak ? "bg-success" : "bg-base-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
              <div className="card-body p-5 sm:p-6 space-y-4">
                <h2 className="card-title">Achievements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BADGES.map((badge) => {
                    const earned = badge.isEarned(stats);
                    return (
                      <div
                        key={badge.id}
                        className={`flex flex-col items-center text-center gap-1 p-3 rounded-2xl border ${
                          earned
                            ? "bg-secondary/10 border-secondary/30"
                            : "bg-base-200 border-transparent opacity-50"
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-xs font-semibold">{badge.label}</span>
                        <span className="text-[11px] text-base-content/60">
                          {badge.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
