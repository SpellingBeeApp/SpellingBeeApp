"use client";

import Link from "next/link";
import Image from "next/image";

export default function VocabularyComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-safe pb-safe honeycomb-bg">
      <div className="card card-modern rounded-3xl w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-5 sm:p-8 items-center text-center space-y-4">
          <Link
            href="/"
            className="btn btn-ghost btn-sm rounded-full self-start -ml-2 -mb-2"
          >
            ← Home
          </Link>
          <Image
            alt="Scripps Spelling Bee Logo"
            src="/sb003.png"
            width={200}
            height={140}
            className="w-32 h-auto"
          />
          <h1 className="text-2xl sm:text-3xl font-bold">📚 Vocabulary Games</h1>
          <p className="text-base-content/70">
            Word-meaning games are on their way — learn what words mean, not
            just how to spell them.
          </p>
          <Link href="/practice" className="btn btn-primary rounded-full">
            Practice Spelling Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
