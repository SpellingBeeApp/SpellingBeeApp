"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Volume2, Send, RotateCcw, Check, X } from "lucide-react";
import { PRACTICE_LISTS } from "@/data/practiceWords";
import { isSpellingCorrect } from "@/helpers/isSpellingCorrect";
import {
  loadPracticeProgress,
  recordCompletedSession,
  recordMissedWord,
} from "@/helpers/practiceProgress";
import useWordPronunciation from "@/hooks/useWordPronunciation";
import { maskWordInText } from "@/helpers/maskWordInText";
import { PracticeWord, QuizResult } from "@/types/PracticeWord";

type QuizPhase = "setup" | "quiz" | "summary";

export default function PracticeQuiz() {
  const [phase, setPhase] = React.useState<QuizPhase>("setup");
  const [selectedList, setSelectedList] =
    React.useState<keyof typeof PRACTICE_LISTS>("grade5");
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

  const { isSupported, isSpeaking, speak, stop } = useWordPronunciation();

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  const startQuiz = () => {
    const list = PRACTICE_LISTS[selectedList].words;
    setWords([...list]);
    setCurrentIndex(0);
    setResults([]);
    setGuess("");
    setLastFeedback(null);
    setHasSubmitted(false);
    setWordStartTime(Date.now());
    setPhase("quiz");
  };

  React.useEffect(() => {
    if (phase !== "quiz" || !currentWord) return;

    setGuess("");
    setLastFeedback(null);
    setHasSubmitted(false);
    setWordStartTime(Date.now());

    const timer = window.setTimeout(() => {
      speak(currentWord.word, { announce: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [phase, currentIndex, currentWord, speak]);

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

    if (!correct) {
      recordMissedWord(currentWord.word);
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
  };

  const correctCount = results.filter((r) => r.correct).length;
  const scorePercent =
    results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const progress = loadPracticeProgress();

  if (phase === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 honeycomb-bg">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center">
              <Link href="/">
                <Image
                  alt="Scripps Spelling Bee Logo"
                  src="/sb003.png"
                  width={280}
                  height={200}
                  className="object-contain"
                />
              </Link>
            </div>

            <h1 className="text-2xl font-bold text-center">Practice Quiz</h1>
            <p className="text-center text-base-content/70">
              Hear each word, spell it from memory, and track your progress.
            </p>

            {!isSupported && (
              <div className="alert alert-warning">
                <span>
                  Audio pronunciation is not supported in this browser.
                </span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Word list</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedList}
                onChange={(e) =>
                  setSelectedList(
                    e.target.value as keyof typeof PRACTICE_LISTS,
                  )
                }
              >
                {Object.entries(PRACTICE_LISTS).map(([key, list]) => (
                  <option key={key} value={key}>
                    {list.label} ({list.words.length} words)
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={startQuiz}
              disabled={!isSupported}
            >
              Start Quiz
            </button>

            {progress.sessionsCompleted > 0 && (
              <p className="text-center text-sm text-base-content/60">
                Sessions completed: {progress.sessionsCompleted}
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
      <div className="min-h-screen flex items-center justify-center p-4 honeycomb-bg">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <h1 className="text-2xl font-bold text-center">Quiz Complete!</h1>

            <div className="stat bg-primary/10 rounded-box">
              <div className="stat-title text-center">Your Score</div>
              <div className="stat-value text-center text-primary">
                {scorePercent}%
              </div>
              <div className="stat-desc text-center">
                {correctCount} of {results.length} correct
              </div>
            </div>

            {missed.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-semibold">Words to review</h2>
                {missed.map((result) => (
                  <div
                    key={result.word}
                    className="flex justify-between items-center p-3 bg-base-200 rounded-lg"
                  >
                    <span className="line-through text-error/70">
                      {result.guess}
                    </span>
                    <span className="font-medium">{result.word}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={restartQuiz}>
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
              <Link href="/" className="btn btn-outline flex-1">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 honeycomb-bg">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
          <span className="badge badge-secondary">
            Word {currentIndex + 1} of {words.length}
          </span>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center space-y-4">
            <p className="text-base-content/70">Listen and spell the word</p>

            <button
              type="button"
              className={`btn btn-circle btn-lg btn-primary ${
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

            {currentWord && (
              <div className="w-full text-left bg-base-200 p-4 rounded-lg space-y-1">
                {currentWord.partOfSpeech && (
                  <p className="text-sm font-medium text-secondary">
                    {currentWord.partOfSpeech}
                  </p>
                )}
                <p className="text-base-content/80">
                  {hasSubmitted
                    ? currentWord.definition
                    : maskWordInText(currentWord.definition, currentWord.word)}
                </p>
                {currentWord.sentence && (
                  <p className="text-sm italic text-base-content/60">
                    &ldquo;
                    {hasSubmitted
                      ? currentWord.sentence
                      : maskWordInText(currentWord.sentence, currentWord.word)}
                    &rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {!hasSubmitted ? (
              <>
                <label className="label">
                  <span className="label-text">Your spelling</span>
                </label>
                <div className="join w-full">
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    className="input input-bordered join-item w-full"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value.toLowerCase())}
                    onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                    autoFocus
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={submitGuess}
                    disabled={!guess.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              lastFeedback && (
                <div className="space-y-4">
                  <div
                    className={`alert ${
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
                    className="btn btn-primary w-full"
                    onClick={goToNextWord}
                  >
                    {isLastWord ? "See Results" : "Next Word"}
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        <progress
          className="progress progress-primary w-full"
          value={currentIndex + (hasSubmitted ? 1 : 0)}
          max={words.length}
        />
      </div>
    </div>
  );
}
