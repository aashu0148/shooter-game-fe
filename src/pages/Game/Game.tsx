import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

import Battleground from "@/components/Battleground";
import { useApp } from "@/contexts/app";
import { GameProvider, useGame } from "@/contexts/game";
import { SOCKET_EVENTS } from "@/utils/enums";

function GameMain() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useApp();
  const { setRoom, setPlayer } = useGame();
  const location = useLocation();

  useEffect(() => {
    const playerName = sessionStorage.getItem("playerName");
    const { room, player } = location.state || {};

    if (!playerName || !socket) {
      navigate("/");
      return;
    }

    // Check if we have the required state from router
    if (!room || !player) {
      toast.error("Invalid game session. Please join again.");
      navigate("/");
      return;
    }

    setRoom(room);
    setPlayer(player);
  }, [socket, navigate]);

  useEffect(() => {
    if (!socket) return;

    // Listen for player joined events
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      setRoom(data.room);
      toast.success(`${data.player?.name} joined the room!`);
    });
    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      setRoom(data.room);
      toast.info(`${data.playerId} left the room!`);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_JOINED);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT);
    };
  }, [socket]);

  if (!roomId || !socket) {
    return null;
  }

  return (
    <div className="w-full h-screen bg-gray-900">
      <Battleground />
    </div>
  );
}

function Game() {
  return (
    <GameProvider>
      <GameMain />
    </GameProvider>
  );
}

export default Game;
