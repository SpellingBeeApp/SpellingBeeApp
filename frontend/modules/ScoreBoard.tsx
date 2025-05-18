import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

type Player = {
  name: string;
  score: number;
};

interface ScoreboardProps {
  winners: Player[];
}

const podiumColors: Record<number, string> = {
  1: "bg-[#FFD700]", // Gold
  2: "bg-[#C0C0C0]", // Silver
  3: "bg-[#CD7F32]", // Bronze
};

const Scoreboard: React.FC<ScoreboardProps> = ({ winners }) => {
  const ordered = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = [100, 120, 90];
  const [topScoringPlayers, setTopScoringPlayers] = React.useState<Player[]>([])
  // Confetti and sound for 1st place
  useEffect(() => {
    const topPlayers = winners.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    setTopScoringPlayers(topPlayers)
    // Step 3: (Optional) Print them
    // topScoringPlayers.forEach(player => {
    //   console.log(`${player.name} scored ${player.score}`);
    // });
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
    <div className="flex items-end justify-center gap-6 h-40 mt-10">
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

export default Scoreboard;
