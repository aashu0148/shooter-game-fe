import { Socket } from "socket.io-client";

import { SOCKET_EVENTS } from "@/utils/enums";

export const joinRoom = (
  socket: Socket,
  { roomId, player }: { roomId: string; player: { id: string; name: string } }
) => {
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, player });
};

export const leaveRoom = (
  socket: Socket,
  { roomId, playerId }: { roomId: string; playerId: string }
) => {
  socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId, playerId });
};
