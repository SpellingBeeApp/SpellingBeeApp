"use client";

/**
 * @file The home page — a hub where the user picks what they want to do
 */

import Image from "next/image";
import Link from "next/link";

type HubOption = {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  className: string;
};

const HUB_OPTIONS: HubOption[] = [
  {
    href: "/practice",
    emoji: "🎯",
    title: "Spelling Practice",
    subtitle: "Practice spelling word by word",
    className: "bg-primary text-primary-content",
  },
  {
    href: "/vocabulary",
    emoji: "📚",
    title: "Vocabulary Games",
    subtitle: "Learn what words mean, the fun way",
    className: "bg-accent text-accent-content",
  },
  {
    href: "/compete",
    emoji: "🐝",
    title: "Live Competition",
    subtitle: "Host or join a real-time spelling bee",
    className: "bg-secondary text-secondary-content",
  },
  {
    href: "/dashboard",
    emoji: "📊",
    title: "My Dashboard",
    subtitle: "See your strengths & progress",
    className: "bg-base-200 text-base-content",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-safe pb-safe honeycomb-bg overflow-x-hidden w-full max-w-[100vw]">
      <div className="card card-modern rounded-3xl w-full max-w-lg bg-base-100 shadow-2xl">
        <div className="card-body p-5 sm:p-8">
          <div className="flex justify-center">
            <Image
              alt="Scripps Spelling Bee Logo"
              src="/sb003.png"
              width={280}
              height={200}
              className="object-contain w-40 sm:w-56 h-auto"
              priority
            />
          </div>
          <p className="text-center text-base-content/70">
            What do you want to do today?
          </p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {HUB_OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className={`rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-1 min-h-[120px] shadow-md active:scale-95 transition-transform ${option.className}`}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="font-bold text-sm sm:text-base">
                  {option.title}
                </span>
                <span className="text-xs opacity-80">{option.subtitle}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
