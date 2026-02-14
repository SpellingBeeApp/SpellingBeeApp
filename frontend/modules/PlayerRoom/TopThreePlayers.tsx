import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Player } from "@/types";

interface TopThreePlayersProps {
  winners: Player[];
}

const podiumColors: Record<number, string> = {
  1: "bg-[#FFD700]", // Gold
  2: "bg-[#C0C0C0]", // Silver
  3: "bg-[#CD7F32]", // Bronze
};

const TopThreePlayers: React.FC<TopThreePlayersProps> = ({ winners }) => {
  const ordered = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = [100, 120, 90];
  const [topScoringPlayers, setTopScoringPlayers] = React.useState<Player[]>([]);

  // Tiebreaker: sort by score, then by fastest correct guess for last word
  useEffect(() => {
    const topPlayers = [...winners].sort((a, b) => {
      if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
      // Tiebreaker: fastest correct guess for last word
      const getLastTime = (player: Player) => {
        if (!player.guesses) return Infinity;
        // Ensure all word indices are numbers
        const allWordIndices = winners.flatMap(p => (p.guesses ?? []).map(g => typeof g[1] === 'string' ? parseInt(g[1], 10) : g[1]));
        const lastWordIndex = allWordIndices.length ? Math.max(...allWordIndices) : 0;
        return (player.guesses ?? [])
          .filter(g => {
            const idx = typeof g[1] === 'string' ? parseInt(g[1], 10) : g[1];
            return idx === lastWordIndex && g[0] && typeof g[2] === 'number';
          })
          .reduce((min, g) => (typeof g[2] === 'number' && g[2] < min ? g[2] : min), Infinity);
      };
      return getLastTime(a) - getLastTime(b);
    });
    setTopScoringPlayers(topPlayers);

    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.3 },
        zIndex: 9999,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [winners]);

  return (
    <div className="flex items-end justify-center gap-6 lg:pt-4">
      {ordered.map((displayIndex, i) => {
        const winner = topScoringPlayers[displayIndex];
        if (!winner) return null;
        const position = displayIndex + 1;

        return (
          <motion.div
            key={winner.name}
            className={`flex flex-col items-center justify-end w-24 rounded-t-lg shadow-lg ${podiumColors[position]}`}
            style={{ height: `${heights[i]}px` }}
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.6 }}
          >
            <div className="mb-2">
              {/* Always-visible, elegant medal icon */}
              <div className="flex justify-center text-5xl sm:text-6xl md:text-7xl transition-transform duration-300 ease-in-out drop-shadow-md">
                {position === 1 && <span>🥇</span>}
                {position === 2 && <span>🥈</span>}
                {position === 3 && <span>🥉</span>}
              </div>
            </div>

            {/* Winner's name */}
            <div className="text-white text-base font-bold tracking-wide text-center px-2 mb-1">
              {winner.name}
            </div>

            {/* Winner's score */}
            <div className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
              {winner.score} pts
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TopThreePlayers;
