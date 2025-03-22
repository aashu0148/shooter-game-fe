import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

import Battleground from "@/components/Battleground";
import { useApp } from "@/contexts/app";
import { GameProvider, useGame } from "@/contexts/game";
import { SOCKET_EVENTS } from "@/utils/enums";
import RightSidebar from "./RightSidebar";
import { Room, RoomPlayer } from "@/utils/definitions";
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
    const handlePlayerJoined = (data: { room: Room; player: RoomPlayer }) => {
      setRoom(data.room);
      toast.success(`${data.player?.name} joined the room!`);
    };
    const handlePlayerLeft = (data: {
      room: Room;
      roomId: string;
      playerId: string;
    }) => {
      setRoom((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== data.playerId),
      }));
      toast.info(`${data.playerId} left the room!`);
    };
    const handleGameOver = () => {
      setRoom((p) => ({ ...p, status: "over" }));
    };
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socket.on(SOCKET_EVENTS.PLAYER_LEFT, handlePlayerLeft);
    socket.on(SOCKET_EVENTS.GAME_OVER, handleGameOver);

    // Cleanup listener on unmount
    return () => {
      socket.off(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT, handlePlayerLeft);
      socket.off(SOCKET_EVENTS.GAME_OVER, handleGameOver);
    };
  }, [socket]);

  if (!roomId || !socket) {
    return null;
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex">
      <div className="flex-1">
        <Battleground />
      </div>
      <RightSidebar />
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
