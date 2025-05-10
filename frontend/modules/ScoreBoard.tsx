import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

type Winner = {
  name: string;
  score: number;
};

interface ScoreboardProps {
  winners: Winner[];
}

const podiumColors: Record<number, string> = {
  1: "bg-[#FFD700]", // Gold
  2: "bg-[#C0C0C0]", // Silver
  3: "bg-[#CD7F32]", // Bronze
};

const Scoreboard: React.FC<ScoreboardProps> = ({ winners }) => {
  const ordered = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = [100, 120, 90];

  // Confetti and sound for 1st place
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.3 },
        zIndex: 9999,
      });

      // Optional: play a trumpet sound or similar
      const audio = new Audio("/trumpet-fanfare.mp3"); // place this in /public
      audio.play();
    }, 1200); // aligns with 1st place animation delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-end justify-center gap-6 h-80 mt-10">
      {ordered.map((displayIndex, i) => {
        const winner = winners[displayIndex];
        if (!winner) return null;
        const position = displayIndex + 1;

        return (
          <motion.div
            key={winner.name}
            className={`flex flex-col items-center justify-end w-24 rounded-t-lg shadow-lg ${
              podiumColors[position]
            }`}
            style={{ height: `${heights[i]}px` }}
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.6 }}
          >

     

<div className="mb-2">
  {/* Medal emoji (visible on md and up) */}
  <div className="hidden md:block text-4xl">
    {position === 1 && "🥇"}
    {position === 2 && "🥈"}
    {position === 3 && "🥉"}
  </div>

  {/* Number badge (visible on small screens) */}
  <div className="block md:hidden bg-white text-black text-sm font-semibold px-3 py-1 rounded-full shadow ring-2 ring-offset-2 ring-black drop-shadow-glow">
    {position === 1 && "1st"}
    {position === 2 && "2nd"}
    {position === 3 && "3rd"}
  </div>
</div>
            <div className="text-center text-white font-semibold">{winner.name}</div>
            <div className="text-sm text-white mb-2">{winner.score} pts</div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Scoreboard;


