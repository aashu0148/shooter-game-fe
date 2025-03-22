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

function App() {
  const { socket, connectToSocket } = useSocket(true);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const { setSocket } = useApp();

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
