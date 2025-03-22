import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SOCKET_EVENTS } from "@/utils/enums";
import { joinRoom } from "@/messages/home";
import { useApp } from "@/contexts/app";

function Home() {
  const { socket } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  const [playerName, setPlayerName] = useState(
    sessionStorage.getItem("playerName") || ""
  );
  const [username, setUsername] = useState(
    sessionStorage.getItem("username") || ""
  );
  const [step, setStep] = useState<"name" | "room">(
    playerName && username ? "room" : "name"
  );
  const [roomName, setRoomName] = useState("");
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem("playerName");
    const savedUsername = sessionStorage.getItem("username");
    if (savedName && savedUsername) {
      setPlayerName(savedName);
      setUsername(savedUsername);
      setStep("room");
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
        toast.success(`${data.player?.name} joined the room!`);
      });

      socket.on(SOCKET_EVENTS.JOINED_ROOM, (data) => {
        setIsJoining(false);
        navigate(`/game/${roomName}`, {
          state: {
            room: data?.room,
            player: data?.player,
          },
        });
      });

      socket.on(SOCKET_EVENTS.ERROR, () => {
        setIsJoining(false);
      });

      return () => {
        socket.off(SOCKET_EVENTS.PLAYER_JOINED);
        socket.off(SOCKET_EVENTS.PLAYER_LEFT);
        socket.off(SOCKET_EVENTS.JOINED_ROOM);
        socket.off(SOCKET_EVENTS.ERROR);
      };
    }
  }, [socket, roomName, navigate]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim().length < 2) {
      toast.error("Name must be at least 2 characters long!");
      return;
    }

    if (username.trim().length < 5) {
      toast.error("Username must be at least 5 characters long!");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      toast.error("Username can only contain letters and numbers!");
      return;
    }

    sessionStorage.setItem("playerName", playerName);
    sessionStorage.setItem("username", username);
    setStep("room");
  };

  const handleRoomAction = async () => {
    if (!socket) {
      toast.error("Not connected to server!");
      return;
    }

    if (roomName.trim().length < 3) {
      toast.error("Room name must be at least 3 characters long!");
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(roomName)) {
      toast.error(
        "Room name can only contain letters, numbers, hyphens and underscores!"
      );
      return;
    }

    const player = {
      id: username,
      name: playerName,
    };

    setIsJoining(true);
    joinRoom(socket, { roomId: roomName, player });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Shooting Game</h1>
          <p className="text-gray-400">A multiplayer shooting experience</p>
        </div>

        {isMobile && (
          <div className="mt-4 p-4 bg-red-900/50 rounded-lg">
            <p className="text-red-200 text-center">
              This game is only playable on desktop or laptop devices. Please
              switch to a larger screen to play.
            </p>
          </div>
        )}

        {!isMobile && step === "name" ? (
          <form onSubmit={handleNameSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="playerName"
                className="text-white block mb-2 text-sm font-medium"
              >
                Enter your display name
              </label>
              <Input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your display name"
                className="text-white px-4 py-3 rounded-lg"
                minLength={2}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="username"
                className="text-white block mb-2 text-sm font-medium"
              >
                Choose a username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (letters and numbers only)"
                className="text-white px-4 py-3 rounded-lg"
                minLength={5}
                pattern="[a-zA-Z0-9]+"
              />
              <p className="text-gray-400 text-sm mt-2">
                Username must be at least 5 characters long and can only contain
                letters and numbers.
              </p>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        ) : !isMobile ? (
          <div className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="roomName"
                className="text-white block mb-2 text-sm font-medium"
              >
                Room Name
              </label>
              <Input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="text-white px-4 py-3 rounded-lg"
                minLength={3}
                disabled={isJoining}
              />
            </div>
            <Button
              onClick={handleRoomAction}
              variant="default"
              size="lg"
              className="w-full"
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Home;
