import { useEffect, useRef, useState } from "react";

import { useApp } from "@/contexts/app";
import { useGame } from "@/contexts/game";
import { SOCKET_EVENTS } from "@/utils/enums";
import { Button } from "@/components/ui/button";
import { sendRestartGame } from "@/messages/battleground";
import { Room } from "@/utils/definitions";

function RightSidebar() {
  const { socket } = useApp();
  const { room } = useGame();
  const [score, setScore] = useState(0);
  const highestScore = useRef(
    parseInt(localStorage.getItem("shooter-score") + "") || 0
  );

  const handleRestart = () => {
    if (!socket || !room) return;

    sendRestartGame(socket, { roomId: room.id });
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for player joined events
    const handleBugKilled = (data: { room: Room }) => {
      const score = data?.room?.score;

      if (score > highestScore.current) {
        highestScore.current = score;
        localStorage.setItem("shooter-score", score + "");
      }

      setScore(score);
    };

    const handleGameRestarted = () => {
      setScore(0);
    };

    socket.on(SOCKET_EVENTS.BUG_KILLED, handleBugKilled);
    socket.on(SOCKET_EVENTS.GAME_RESTARTED, handleGameRestarted);

    // Cleanup listener on unmount
    return () => {
      socket.off(SOCKET_EVENTS.BUG_KILLED, handleBugKilled);
      socket.off(SOCKET_EVENTS.GAME_RESTARTED, handleGameRestarted);
    };
  }, [socket]);

  return (
    <div className="w-80 bg-gray-800 p-4 text-white">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Players</h2>
        {/* Display connected players */}
        <div className="space-y-2">
          {room?.players?.map((player) => (
            <div key={player.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Score</h2>
        <div className="text-2xl font-bold text-green-400">{score}</div>
        <div className="text-sm text-gray-400 mt-1">
          Highest: {highestScore.current}
        </div>
      </div>

      {room?.status === "over" && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-3">Game Over!</h2>
          <Button onClick={handleRestart}>Restart Game</Button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-3">How to Play</h2>
        <ul className="space-y-2 text-sm">
          <li>• Use Keyboard Up/Down keys to move</li>
          <li>• Use Space key to shoot</li>
        </ul>
      </div>
    </div>
  );
}

export default RightSidebar;
