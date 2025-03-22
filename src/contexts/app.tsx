import { createContext, useContext, useState } from "react";
import { Socket } from "socket.io-client";

interface ContextValue {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

const AppContext = createContext<ContextValue>({} as ContextValue);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  return (
    <AppContext.Provider value={{ socket, setSocket }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext<ContextValue>(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
