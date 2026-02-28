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
  const [topScoringPlayers, setTopScoringPlayers] = React.useState<Player[]>(
    [],
  );

  // Tiebreaker: sort by score, then by fastest correct guess for last word
  useEffect(() => {
    const topPlayers = [...winners].sort((a, b) => {
      if ((b.score ?? 0) !== (a.score ?? 0))
        return (b.score ?? 0) - (a.score ?? 0);
      // Tiebreaker: fastest correct guess for last word
      const getLastTime = (player: Player) => {
        if (!player.guesses) return Infinity;
        // Ensure all word indices are numbers
        const allWordIndices = winners.flatMap((p) =>
          (p.guesses ?? []).map((g) =>
            typeof g[1] === "string" ? parseInt(g[1], 10) : g[1],
          ),
        );
        const lastWordIndex = allWordIndices.length
          ? Math.max(...allWordIndices)
          : 0;
        return (player.guesses ?? [])
          .filter((g) => {
            const idx = typeof g[1] === "string" ? parseInt(g[1], 10) : g[1];
            return idx === lastWordIndex && g[0] && typeof g[2] === "number";
          })
          .reduce(
            (min, g) => (typeof g[2] === "number" && g[2] < min ? g[2] : min),
            Infinity,
          );
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

        // Find the highest word index among all players (assume all played same rounds)
        const allWordIndices = topScoringPlayers.flatMap((p) =>
          (p.guesses ?? []).map((g) =>
            typeof g[1] === "string" ? parseInt(g[1], 10) : g[1],
          ),
        );
        const lastWordIndex = allWordIndices.length
          ? Math.max(...allWordIndices)
          : 0;
        // Get the timestamp for the last word for this winner
        const lastGuessTime = (winner.guesses ?? [])
          .filter((g) => {
            const idx = typeof g[1] === "string" ? parseInt(g[1], 10) : g[1];
            return idx === lastWordIndex && g[0] && typeof g[2] === "number";
          })
          .reduce(
            (min, g) => (typeof g[2] === "number" && g[2] < min ? g[2] : min),
            Infinity,
          );

        // Check if there is a tie for this position (same score as next or previous)
        const isTie =
          (topScoringPlayers[displayIndex - 1] &&
            topScoringPlayers[displayIndex - 1].score === winner.score) ||
          (topScoringPlayers[displayIndex + 1] &&
            topScoringPlayers[displayIndex + 1].score === winner.score);

        // Debug: log values to diagnose why time is not showing
        // eslint-disable-next-line no-console
        console.log("Podium:", {
          name: winner.name,
          isTie,
          lastGuessTime,
          lastWordIndex,
          guesses: winner.guesses,
        });
        return (
          <motion.div
            key={winner.name}
            className={`relative flex flex-col items-center justify-end w-24 sm:w-32 md:w-40 rounded-t-lg shadow-lg ${podiumColors[position]}`}
            style={{ height: `${heights[i]}px` }}
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: i * 0.6 }}
          >
            {/* Winner's name always at the top of the bar */}
            <div
              className="text-white text-base font-bold tracking-wide text-center px-1 pt-2 w-full"
              style={{
                maxWidth: "100%",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                whiteSpace: "normal",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 2,
              }}
              title={winner.name}
            >
              {winner.name}
            </div>
            <div style={{ height: "2.2em" }} />

            {/* Winner's score and total time (responsive, no overlap) */}
            <div
              className="text-white font-semibold flex flex-col xs:flex-row items-center xs:space-x-2 xs:space-y-0 space-y-1 w-full justify-center"
              style={{ minWidth: 0, wordBreak: "break-word" }}
            >
              <span
                className="flex items-center font-extrabold text-lg sm:text-xl text-yellow-600 drop-shadow-sm whitespace-nowrap tracking-wide font-mono"
                style={{ lineHeight: 1 }}
              >
                {/* Trophy/medal for top 3 */}
                {position === 1 && <span className="mr-1">🥇</span>}
                {position === 2 && <span className="mr-1">🥈</span>}
                {position === 3 && <span className="mr-1">🥉</span>}
                <span>{winner.score}%</span>
              </span>
              {/* Total time taken for all words */}
              {winner.guesses && winner.guesses.length > 0 && (
                <span
                  className="flex items-center text-xs xs:text-xs whitespace-nowrap text-gray-200 font-mono font-semibold opacity-90"
                  style={{ marginTop: 0 }}
                >
                  <span className="mr-1">🏁</span>
                  {winner.guesses
                    .map((g) => (typeof g[3] === "number" ? g[3] : 0))
                    .reduce((sum, t) => sum + t, 0)}
                  s
                </span>
              )}
            </div>

            {/* Show last word time if there is a valid time (smaller) */}
            {/* {lastGuessTime !== Infinity && (
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.92)",
                  marginTop: "4px",
                  textAlign: "center",
                  maxWidth: "90vw",
                  minWidth: 0,
                  overflowWrap: "break-word",
                  display: "inline-block",
                  lineHeight: 1.2,
                  boxSizing: "border-box",
                  whiteSpace: "pre-line",
                  textShadow: "0 1px 4px rgba(0,0,0,0.18)",
                  fontWeight: 500,
                }}
                title={new Date(lastGuessTime).toLocaleString()}
              >
                <span style={{ marginRight: 3, fontSize: "11px" }}>⏱️</span>
                <span
                  style={{ verticalAlign: "middle", wordBreak: "break-word" }}
                >
                  {(() => {
                    const time = new Date(lastGuessTime).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      },
                    );
                    const match = time.match(/(.*?)(\s?[AP]M)$/i);
                    if (match) {
                      return (
                        <>
                          {match[1]}
                          <span style={{ fontSize: "10px", marginLeft: 2 }}>
                            {match[2]}
                          </span>
                        </>
                      );
                    }
                    return time;
                  })()}
                </span>
              </div>
            )} */}
          </motion.div>
        );
      })}
    </div>
  );
};

export default TopThreePlayers;
