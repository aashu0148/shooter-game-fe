import { Room, RoomPlayer } from "@/utils/definitions";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface ContextValue {
  player: RoomPlayer;
  room: Room;
  setRoom: Dispatch<SetStateAction<Room>>;
  setPlayer: Dispatch<SetStateAction<RoomPlayer>>;
}

const GameContext = createContext<ContextValue>({} as ContextValue);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [room, setRoom] = useState<Room>({} as Room);
  const [player, setPlayer] = useState<RoomPlayer>({} as RoomPlayer);

  return (
    <GameContext.Provider value={{ room, setRoom, player, setPlayer }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext<ContextValue>(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
