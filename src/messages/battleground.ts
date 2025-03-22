import { Socket } from "socket.io-client";

import { SOCKET_EVENTS } from "@/utils/enums";
import { Bug, Position, Bullet } from "@/utils/definitions";

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

export const sendFireBullet = (
  socket: Socket,
  {
    roomId,
    playerId,
    bullet,
  }: {
    roomId: string;
    playerId: string;
    bullet: Bullet;
  }
) => {
  socket.emit(SOCKET_EVENTS.FIRE_BULLET, { roomId, playerId, bullet });
};

export const sendUpdateBullets = (
  socket: Socket,
  {
    roomId,
    playerId,
    bullets,
  }: {
    roomId: string;
    playerId: string;
    bullets: Bullet[];
  }
) => {
  socket.emit(SOCKET_EVENTS.UPDATE_BULLETS, { roomId, playerId, bullets });
};

export const sendRestartGame = (
  socket: Socket,
  { roomId }: { roomId: string }
) => {
  socket.emit(SOCKET_EVENTS.RESTART_GAME, { roomId });
};

export const sendGameOver = (
  socket: Socket,
  { roomId }: { roomId: string }
) => {
  socket.emit(SOCKET_EVENTS.GAME_OVER, { roomId });
};
