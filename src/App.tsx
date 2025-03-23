import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { toast } from "sonner";
import Home from "./pages/Home";
import Game from "./pages/Game/Game";
import NotFound from "./pages/NotFound";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { SOCKET_EVENTS } from "@/utils/enums";
import { useApp } from "./contexts/app";
import { appEnvs } from "@/utils/configs";

function App() {
  const { socket, connectToSocket } = useSocket(true);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const { setSocket } = useApp();
  const [isServerBooting, setIsServerBooting] = useState(true);
  const [showBootMessage, setShowBootMessage] = useState(false);

  const checkServer = async () => {
    try {
      const response = await fetch(`${appEnvs.BACKEND_BASE_URL}/hi`);
      if (response.ok) {
        setIsServerBooting(false);
      } else {
        setTimeout(checkServer, 5000); // Retry after 5 seconds
      }
    } catch (error) {
      setTimeout(checkServer, 5000); // Retry after 5 seconds if request fails
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setShowBootMessage(true);
    }, 4000);

    checkServer();
  }, []);

  useEffect(() => {
    connectToSocket();
  }, []);

  useEffect(() => {
    if (socket) {
      setSocket(socket);
      socket.on(SOCKET_EVENTS.CONNECT, () => {
        setIsDisconnected(false);
      });

      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        setIsDisconnected(true);
        toast.error("Disconnected from server!");
      });

      socket.on(SOCKET_EVENTS.ERROR, (error) => {
        toast.error(error || "Something went wrong!");
      });

      return () => {
        socket.off(SOCKET_EVENTS.CONNECT);
        socket.off(SOCKET_EVENTS.DISCONNECT);
        socket.off(SOCKET_EVENTS.ERROR);
      };
    }
  }, [socket]);

  return (
    <BrowserRouter>
      {isDisconnected && (
        <div className="fixed top-0 left-0 right-0 animate-pulse bg-red-500 text-white  p-1 text-sm text-center z-[100]">
          Connection with server lost. Reconnecting...
        </div>
      )}

      {isServerBooting && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[200]">
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4 rounded-lg">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin mb-4"></div>
            {showBootMessage && (
              <div className="text-white text-center max-w-md px-4">
                <p className="mb-2 font-medium">Waking up the game server...</p>
                <p className="text-sm opacity-80">
                  This game is hosted on a free server that goes to sleep after
                  periods of inactivity. It might take 1-2 minutes to boot up.
                  Please wait...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
