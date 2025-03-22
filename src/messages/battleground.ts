import { Socket } from "socket.io-client";

import { SOCKET_EVENTS } from "@/utils/enums";
import { Bug, Position } from "@/utils/definitions";

export const sendHeartbeat = (
  socket: Socket,
  { roomId, playerId }: { roomId: string; playerId: string }
) => {
  console.log("💚");
  socket.emit(SOCKET_EVENTS.HEARTBEAT, { roomId, playerId });
};

export const sendAddBug = (
  socket: Socket,
  { roomId, bug }: { roomId: string; bug: Bug }
) => {
  socket.emit(SOCKET_EVENTS.ADD_BUG, { roomId, bug });
};

export const sendKillBug = (
  socket: Socket,
  {
    roomId,
    bugId,
    playerId,
  }: { roomId: string; bugId: string; playerId: string }
) => {
  socket.emit(SOCKET_EVENTS.KILL_BUG, { roomId, bugId, playerId });
};

export const sendUpdateBugHealth = (
  socket: Socket,
  { roomId, bugId, health }: { roomId: string; bugId: string; health: number }
) => {
  socket.emit(SOCKET_EVENTS.UPDATE_BUG_HEALTH, { roomId, bugId, health });
};

export const sendPlayerMove = (
  socket: Socket,
  {
    roomId,
    playerId,
    position,
  }: {
    roomId: string;
    playerId: string;
    position: Position;
  }
) => {
  socket.emit(SOCKET_EVENTS.PLAYER_MOVE, { roomId, playerId, position });
};
