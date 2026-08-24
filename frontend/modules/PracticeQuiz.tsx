"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, Send, RotateCcw, Check, X, Clock } from "lucide-react";
import {
  ALL_PRACTICE_WORDS,
  DIFFICULTY_LEVELS,
  GRADE_LEVELS,
  PRACTICE_GRADES,
  WORD_LOCATION,
} from "@/data/practiceWords";
import { isSpellingCorrect } from "@/helpers/isSpellingCorrect";
import { classifyMistake } from "@/helpers/classifyMistake";
import {
  loadPracticeProgress,
  recordAttempt,
  recordCompletedSession,
  recordCorrectAttempt,
  recordMissedWord,
} from "@/helpers/practiceProgress";
import useWordPronunciation from "@/hooks/useWordPronunciation";
import Confetti from "./PlayerRoom/Confetti";
import { maskWordInText, textContainsWord } from "@/helpers/maskWordInText";
import { Difficulty, PracticeWord, QuizResult } from "@/types/PracticeWord";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type QuizPhase = "setup" | "quiz" | "summary";
type SpeechSpeed = "normal" | "slow";

const SPEECH_RATES: Record<SpeechSpeed, number> = {
  normal: 0.85,
  slow: 0.5,
};

const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export default function PracticeQuiz() {
  const [phase, setPhase] = React.useState<QuizPhase>("setup");
  const [selectedGrade, setSelectedGrade] = React.useState<number>(5);
  const [selectedDifficulty, setSelectedDifficulty] =
    React.useState<Difficulty>("easy");
  const [words, setWords] = React.useState<PracticeWord[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [guess, setGuess] = React.useState("");
  const [results, setResults] = React.useState<QuizResult[]>([]);
  const [wordStartTime, setWordStartTime] = React.useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = React.useState<{
    correct: boolean;
    guess: string;
    answer: string;
  } | null>(null);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [isReviewMode, setIsReviewMode] = React.useState(false);
  const [showOrigin, setShowOrigin] = React.useState(false);
  const [speechSpeed, setSpeechSpeed] = React.useState<SpeechSpeed>("normal");

  const { isSupported, isSpeaking, speak, stop } = useWordPronunciation({
    rate: SPEECH_RATES[speechSpeed],
  });

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  // Practice history only exists in localStorage, which isn't available
  // during server rendering — load it after mount (and whenever we're back
  // on the setup screen) so the server-rendered HTML and the first client
  // render match, avoiding a hydration mismatch.
  const [progressSummary, setProgressSummary] = React.useState({
    missedWordCount: 0,
    sessionsCompleted: 0,
  });

  React.useEffect(() => {
    if (phase !== "setup") return;
    const progress = loadPracticeProgress();
    setProgressSummary({
      missedWordCount: Object.keys(progress.missedWords).length,
      sessionsCompleted: progress.sessionsCompleted,
    });
  }, [phase]);

  const beginQuiz = (list: PracticeWord[], reviewMode: boolean) => {
    setWords(list);
    setCurrentIndex(0);
    setResults([]);
    setGuess("");
    setLastFeedback(null);
    setHasSubmitted(false);
    setWordStartTime(Date.now());
    setIsReviewMode(reviewMode);
    setPhase("quiz");
  };

  const startQuiz = () => {
    beginQuiz([...PRACTICE_GRADES[selectedGrade][selectedDifficulty]], false);
  };

  const startReview = () => {
    const missedWords = Object.keys(loadPracticeProgress().missedWords)
      .map((word) => ALL_PRACTICE_WORDS[word])
      .filter((word): word is PracticeWord => Boolean(word));

    if (missedWords.length === 0) return;
    beginQuiz(missedWords, true);
  };

  React.useEffect(() => {
    if (phase !== "quiz" || !currentWord) return;

    setGuess("");
    setLastFeedback(null);
    setHasSubmitted(false);
    setShowOrigin(false);
    setWordStartTime(Date.now());

    const timer = window.setTimeout(() => {
      speak(currentWord.word, { announce: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [phase, currentIndex, currentWord, speak]);

  React.useEffect(() => {
    if (phase !== "quiz" || !wordStartTime || hasSubmitted) return;

    setElapsedSeconds(Math.floor((Date.now() - wordStartTime) / 1000));
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - wordStartTime) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, wordStartTime, hasSubmitted]);

  React.useEffect(() => {
    return () => stop();
  }, [stop]);

  const submitGuess = () => {
    if (!currentWord || !guess.trim() || hasSubmitted) return;

    const endTime = Date.now();
    const timeTaken = wordStartTime
      ? Math.round((endTime - wordStartTime) / 1000)
      : 0;
    const correct = isSpellingCorrect(guess, currentWord.word);

    const result: QuizResult = {
      word: currentWord.word,
      guess: guess.trim().toLowerCase(),
      correct,
      timeTaken,
    };

    setResults((prev) => [...prev, result]);
    setLastFeedback({
      correct,
      guess: guess.trim().toLowerCase(),
      answer: currentWord.word,
    });
    setHasSubmitted(true);

    if (correct) {
      recordCorrectAttempt(currentWord.word);
    } else {
      recordMissedWord(currentWord.word);
    }

    const location = WORD_LOCATION[currentWord.word];
    if (location) {
      recordAttempt({
        word: currentWord.word,
        grade: location.grade,
        difficulty: location.difficulty,
        correct,
        mistakeType: correct
          ? undefined
          : classifyMistake(guess, currentWord.word),
      });
    }
  };

  const goToNextWord = () => {
    if (isLastWord) {
      recordCompletedSession();
      setPhase("summary");
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const replayWord = () => {
    if (!currentWord) return;
    speak(currentWord.word);
  };

  const restartQuiz = () => {
    stop();
    setPhase("setup");
    setCurrentIndex(0);
    setResults([]);
    setGuess("");
    setLastFeedback(null);
    setHasSubmitted(false);
    setIsReviewMode(false);
  };

  const correctCount = results.filter((r) => r.correct).length;
  const scorePercent =
    results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const totalTimeTaken = results.reduce((sum, r) => sum + r.timeTaken, 0);
  const averageTimeTaken =
    results.length > 0 ? Math.round(totalTimeTaken / results.length) : 0;

  if (phase === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-safe pb-safe honeycomb-bg">
        <div className="card card-modern rounded-3xl w-full max-w-lg bg-base-100 shadow-2xl">
          <div className="card-body p-5 sm:p-8">
            <div className="flex justify-center">
              <Link href="/">
                <Image
                  alt="Scripps Spelling Bee Logo"
                  src="/sb003.png"
                  width={280}
                  height={200}
                  className="object-contain w-40 sm:w-56 h-auto"
                />
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Practice Quiz
            </h1>
            <p className="text-center text-base-content/70">
              Hear each word, spell it from memory, and track your progress.
            </p>

            {!isSupported && (
              <div className="alert alert-warning rounded-xl">
                <span>
                  Audio pronunciation is not supported in this browser.
                </span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Grade level</span>
              </label>
              <select
                className="select select-bordered rounded-xl w-full"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
              >
                {GRADE_LEVELS.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Difficulty</span>
              </label>
              <select
                className="select select-bordered rounded-xl w-full"
                value={selectedDifficulty}
                onChange={(e) =>
                  setSelectedDifficulty(e.target.value as Difficulty)
                }
              >
                {DIFFICULTY_LEVELS.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {DIFFICULTY_LABELS[difficulty]} (
                    {PRACTICE_GRADES[selectedGrade][difficulty].length} words)
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-lg rounded-full w-full mt-2"
              onClick={startQuiz}
              disabled={!isSupported}
            >
              Start Quiz 🎯
            </button>

            {progressSummary.missedWordCount > 0 && (
              <button
                className="btn btn-outline btn-secondary rounded-full w-full"
                onClick={startReview}
                disabled={!isSupported}
              >
                📚 Review Missed Words ({progressSummary.missedWordCount})
              </button>
            )}

            {progressSummary.sessionsCompleted > 0 && (
              <p className="text-center text-sm text-base-content/60">
                🐝 Sessions completed: {progressSummary.sessionsCompleted}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "summary") {
    const missed = results.filter((r) => !r.correct);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-safe pb-safe honeycomb-bg">
        <Confetti />
        <div className="card card-modern rounded-3xl w-full max-w-lg bg-base-100 shadow-2xl">
          <div className="card-body p-5 sm:p-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              🎉 Quiz Complete!
            </h1>

            <div className="stats stats-vertical sm:stats-horizontal w-full shadow bg-primary/10 rounded-2xl">
              <div className="stat">
                <div className="stat-title text-center">Your Score</div>
                <div className="stat-value text-center text-primary">
                  {scorePercent}%
                </div>
                <div className="stat-desc text-center">
                  {correctCount} of {results.length} correct
                </div>
              </div>

              <div className="stat">
                <div className="stat-title text-center">Total Time</div>
                <div className="stat-value text-center text-primary">
                  {formatDuration(totalTimeTaken)}
                </div>
                <div className="stat-desc text-center">
                  {averageTimeTaken}s avg per word
                </div>
              </div>
            </div>

            {missed.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold">Words to review</h2>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {missed.map((result) => (
                    <div
                      key={result.word}
                      className="flex justify-between items-center p-3 bg-base-200 rounded-xl"
                    >
                      <span className="line-through text-error/70">
                        {result.guess}
                      </span>
                      <span className="font-medium">{result.word}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="btn btn-primary rounded-full flex-1"
                onClick={restartQuiz}
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
              <Link href="/" className="btn btn-outline rounded-full flex-1">
                Home
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="link link-hover text-sm text-center text-base-content/60 block"
            >
              📊 View your spelling dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen honeycomb-bg flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pt-safe md:p-6">
        <div className="max-w-xl mx-auto space-y-6 pb-48">
          <div className="flex justify-between items-center">
            <Link href="/" className="btn btn-ghost btn-sm rounded-full">
              ← Home
            </Link>
            <div className="flex items-center gap-2">
              <span className="badge badge-outline rounded-full gap-1 overflow-hidden">
                <motion.span
                  key={elapsedSeconds}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1.35, 1] }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <Clock className="h-3 w-3" />
                </motion.span>
                <span className="relative inline-grid overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={elapsedSeconds}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="col-start-1 row-start-1 tabular-nums"
                    >
                      {formatDuration(elapsedSeconds)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className="badge badge-secondary rounded-full">
                Word {currentIndex + 1} of {words.length}
              </span>
            </div>
          </div>

          {isReviewMode && (
            <div className="badge badge-accent rounded-full gap-1 -mt-2">
              📚 Reviewing missed words
            </div>
          )}

          <div className="card card-modern rounded-3xl bg-base-100 shadow-xl">
            <div className="card-body items-center text-center space-y-4 p-5 sm:p-8">
              <p className="text-base-content/70">Listen and spell the word</p>

              <button
                type="button"
                className={`btn btn-circle btn-lg btn-primary shadow-lg ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
                onClick={replayWord}
                aria-label="Hear word again"
              >
                <Volume2 className="h-8 w-8" />
              </button>

              <p className="text-sm text-base-content/60">
                {isSpeaking ? "Playing..." : "Tap to hear again"}
              </p>

              <div className="join">
                <button
                  type="button"
                  className={`btn btn-xs join-item rounded-l-full ${
                    speechSpeed === "normal" ? "btn-active" : ""
                  }`}
                  onClick={() => setSpeechSpeed("normal")}
                >
                  🐇 Normal
                </button>
                <button
                  type="button"
                  className={`btn btn-xs join-item rounded-r-full ${
                    speechSpeed === "slow" ? "btn-active" : ""
                  }`}
                  onClick={() => setSpeechSpeed("slow")}
                >
                  🐢 Slow
                </button>
              </div>

              {currentWord && (
                <div className="w-full text-left bg-base-200 p-4 rounded-2xl space-y-1">
                  {currentWord.partOfSpeech && (
                    <p className="text-sm font-medium text-secondary">
                      {currentWord.partOfSpeech}
                    </p>
                  )}
                  <p className="text-base-content/80">
                    {hasSubmitted
                      ? currentWord.definition
                      : maskWordInText(
                          currentWord.definition,
                          currentWord.word,
                        )}
                  </p>
                  {currentWord.sentence &&
                    textContainsWord(
                      currentWord.sentence,
                      currentWord.word,
                    ) && (
                      <p className="text-sm italic text-base-content/60">
                        &ldquo;
                        {hasSubmitted
                          ? currentWord.sentence
                          : maskWordInText(
                              currentWord.sentence,
                              currentWord.word,
                            )}
                        &rdquo;
                      </p>
                    )}
                  {currentWord.origin && (
                    <div className="pt-2">
                      {showOrigin ? (
                        <p className="text-sm text-secondary">
                          🌍 Origin: {currentWord.origin}
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs rounded-full px-0 text-secondary"
                          onClick={() => setShowOrigin(true)}
                        >
                          🌍 Show word origin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-base-100/95 backdrop-blur border-t border-base-300 pb-safe z-10">
        <div className="max-w-xl mx-auto p-4 space-y-3">
          <progress
            className="progress progress-primary w-full"
            value={currentIndex + (hasSubmitted ? 1 : 0)}
            max={words.length}
          />

          {!hasSubmitted ? (
            <div className="join w-full">
              <input
                type="text"
                placeholder="Type your answer..."
                className="input input-bordered join-item rounded-l-full w-full"
                value={guess}
                onChange={(e) => setGuess(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                autoFocus
              />
              <button
                className="btn btn-primary join-item rounded-r-full px-6"
                onClick={submitGuess}
                disabled={!guess.trim()}
                aria-label="Submit answer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : (
            lastFeedback && (
              <div className="space-y-3">
                <div
                  className={`alert rounded-xl ${
                    lastFeedback.correct ? "alert-success" : "alert-error"
                  }`}
                >
                  {lastFeedback.correct ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                  <div>
                    {lastFeedback.correct ? (
                      <span>Correct! Well done.</span>
                    ) : (
                      <span>
                        Not quite. You wrote{" "}
                        <strong>{lastFeedback.guess}</strong>, the correct
                        spelling is <strong>{lastFeedback.answer}</strong>.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary rounded-full w-full"
                  onClick={goToNextWord}
                >
                  {isLastWord ? "See Results" : "Next Word"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
