import { useEffect, useRef } from "react";
import { useGame } from "@/contexts/game";
import { useApp } from "@/contexts/app";
import {
  sendHeartbeat,
  sendAddBug,
  sendKillBug,
  sendUpdateBugHealth,
  sendPlayerMove,
} from "@/messages/battleground";
import { Bug, Bullet, Position } from "@/utils/definitions";
import { SOCKET_EVENTS } from "@/utils/enums";
import bug1 from "@/assets/bug-1.svg";
import bug2 from "@/assets/bug-2.svg";
import bug3 from "@/assets/bug-3.svg";
import bug4 from "@/assets/bug-4.svg";

const bugImages: Record<number, string> = {
  1: bug1,
  2: bug2,
  3: bug3,
  4: bug4,
};

const PLAYER_SIZE = 20;
const BULLET_SIZE = 5;
const BUG_SIZE = 20;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const BUG_SPEED = 2;
const SHOOT_DELAY = 100; // ms between shots

function Battleground() {
  const { room, player } = useGame();
  const { socket } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPosRef = useRef<Position>({
    x: PLAYER_SIZE * 2,
    y: 300,
  });
  const bulletsRef = useRef<Bullet[]>([]);
  const bugsRef = useRef<Bug[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const lastShootTime = useRef<number>(0);
  const otherPlayersRef = useRef<Map<string, Position>>(new Map());
  const bugImageRefs = useRef<Record<number, HTMLImageElement>>({});

  useEffect(() => {
    if (!room?.players || !player) return;

    // Clear the current map and rebuild it with active players
    otherPlayersRef.current.clear();
    room.players.forEach((p) => {
      if (p.id !== player.id) {
        otherPlayersRef.current.set(
          p.id,
          p?.position || {
            x: PLAYER_SIZE * 2,
            y: 300,
          }
        );
      }
    });
  }, [room.players, player]);

  useEffect(() => {
    if (!socket || !room || !player) return;

    // heartbeat
    sendHeartbeat(socket, { roomId: room.id, playerId: player.id });
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(socket, { roomId: room.id, playerId: player.id });
    }, 30000);

    // Listen for new bugs added by other players
    const handleBugAdded = ({ bug }: { bug: Bug }) => {
      bugsRef.current = [...bugsRef.current, bug];
    };

    // Listen for bugs killed by other players
    const handleBugKilled = ({ bugId }: { bugId: string }) => {
      bugsRef.current = bugsRef.current.filter((bug) => bug.id !== bugId);
    };

    // Listen for bug health updates from other players
    const handleBugHealthUpdated = ({
      bugId,
      health,
    }: {
      bugId: string;
      health: number;
    }) => {
      bugsRef.current = bugsRef.current.map((bug) => {
        if (bug.id === bugId) {
          return { ...bug, health };
        }
        return bug;
      });
    };

    socket.on(SOCKET_EVENTS.BUG_ADDED, handleBugAdded);
    socket.on(SOCKET_EVENTS.BUG_KILLED, handleBugKilled);
    socket.on(SOCKET_EVENTS.BUG_HEALTH_UPDATED, handleBugHealthUpdated);

    // Listen for other players' movements
    const handlePlayerMoved = ({
      playerId,
      position,
    }: {
      playerId: string;
      position: Position;
    }) => {
      if (playerId !== player.id) {
        otherPlayersRef.current.set(playerId, position);
      }
    };

    socket.on(SOCKET_EVENTS.PLAYER_MOVED, handlePlayerMoved);

    return () => {
      socket.off(SOCKET_EVENTS.BUG_KILLED, handleBugKilled);
      socket.off(SOCKET_EVENTS.BUG_ADDED, handleBugAdded);
      socket.off(SOCKET_EVENTS.BUG_HEALTH_UPDATED, handleBugHealthUpdated);
      socket.off(SOCKET_EVENTS.PLAYER_MOVED, handlePlayerMoved);
      clearInterval(heartbeatInterval);
    };
  }, [socket, room?.id, player]);

  useEffect(() => {
    // Preload images
    Object.entries(bugImages).forEach(([level, src]) => {
      const img = new Image();
      img.src = src;
      bugImageRefs.current[Number(level)] = img;
    });
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket || !room || !player) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Spawn bugs periodically
    const bugSpawnInterval = setInterval(() => {
      const level = Math.floor(Math.random() * 4) + 1;
      const bug = {
        id: crypto.randomUUID(),
        x: canvas.width,
        y: Math.random() * (canvas.height - 20 - BUG_SIZE) + 20,
        active: true,
        level,
        health: level,
      };

      // Emit the new bug to all players
      sendAddBug(socket, { roomId: room.id, bug });
    }, 2000);

    // Main game loop
    const gameLoop = setInterval(() => {
      // Move player
      const newY = keysRef.current.has("ArrowUp")
        ? Math.max(PLAYER_SIZE, playerPosRef.current.y - PLAYER_SPEED)
        : keysRef.current.has("ArrowDown")
        ? Math.min(
            canvas.height - PLAYER_SIZE,
            playerPosRef.current.y + PLAYER_SPEED
          )
        : playerPosRef.current.y;

      const newPosition = {
        x: playerPosRef.current.x,
        y: newY,
      };

      // Only emit movement if position changed
      if (newPosition.y !== playerPosRef.current.y) {
        playerPosRef.current = newPosition;

        // Emit player movement
        sendPlayerMove(socket, {
          roomId: room.id,
          playerId: player.id,
          position: newPosition,
        });
      }

      // Shoot bullets
      if (keysRef.current.has(" ")) {
        const now = Date.now();
        if (now - lastShootTime.current >= SHOOT_DELAY) {
          bulletsRef.current = [
            ...bulletsRef.current,
            {
              x: playerPosRef.current.x + PLAYER_SIZE,
              y: playerPosRef.current.y,
              active: true,
            },
          ];
          lastShootTime.current = now;
        }
      }

      // Move bullets
      bulletsRef.current = bulletsRef.current
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + BULLET_SPEED,
          active: bullet.x < canvas.width,
        }))
        .filter((bullet) => bullet.active);

      // Move bugs
      bugsRef.current = bugsRef.current
        .map((bug) => ({
          ...bug,
          x: bug.x - BUG_SPEED,
          active: bug.x > 0,
        }))
        .filter((bug) => bug.active);

      // Check collisions
      bugsRef.current = bugsRef.current
        .map((bug) => {
          const wasHit = bulletsRef.current.some(
            (bullet) =>
              bullet.active &&
              Math.abs(bullet.x - bug.x) < (BULLET_SIZE + BUG_SIZE) / 2 &&
              Math.abs(bullet.y - bug.y) < (BULLET_SIZE + BUG_SIZE) / 2
          );

          if (wasHit) {
            const newHealth = bug.health - 1;
            if (newHealth <= 0) {
              // Emit bug killed event when health reaches 0
              sendKillBug(socket, {
                roomId: room.id,
                bugId: bug.id,
                playerId: player.id,
              });
              return { ...bug, active: false };
            }
            // Emit health update event
            sendUpdateBugHealth(socket, {
              roomId: room.id,
              bugId: bug.id,
              health: newHealth,
            });
            return { ...bug, health: newHealth };
          }
          return bug;
        })
        .filter((bug) => bug.active);

      // Remove collided bullets
      bulletsRef.current = bulletsRef.current
        .map((bullet) => ({
          ...bullet,
          active:
            bullet.active &&
            !bugsRef.current.some(
              (bug) =>
                Math.abs(bullet.x - bug.x) < (BULLET_SIZE + BUG_SIZE) / 2 &&
                Math.abs(bullet.y - bug.y) < (BULLET_SIZE + BUG_SIZE) / 2
            ),
        }))
        .filter((bullet) => bullet.active);
    }, 1000 / 60); // 30 FPS

    // Render loop
    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw main player
      ctx.beginPath();
      ctx.arc(
        playerPosRef.current.x,
        playerPosRef.current.y,
        PLAYER_SIZE,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "blue";
      ctx.fill();

      // Draw other players
      otherPlayersRef.current.forEach((position, playerId) => {
        ctx.beginPath();
        ctx.arc(position.x, position.y, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = "green"; // Different color for other players
        ctx.fill();

        // Draw player name
        const playerData = room?.players?.find((p) => p.id === playerId);
        if (playerData?.name) {
          ctx.font = "12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(
            playerData.name,
            position.x,
            position.y - PLAYER_SIZE - 5
          );
        }
      });

      // Draw bullets
      bulletsRef.current.forEach((bullet) => {
        if (!bullet.active) return;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = "yellow";
        ctx.fill();
      });

      // Draw bugs
      bugsRef.current.forEach((bug) => {
        if (!bug.active) return;
        const bugImg = bugImageRefs.current[bug.level];
        if (bugImg) {
          ctx.drawImage(
            bugImg,
            bug.x - BUG_SIZE, // Center the image
            bug.y - BUG_SIZE,
            BUG_SIZE * 2, // Make the image twice the size of the original collision circle
            BUG_SIZE * 2
          );

          // Health indicator
          ctx.font = "12px Arial";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText(bug.health.toString(), bug.x, bug.y - BUG_SIZE - 5);
        }
      });

      requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      clearInterval(gameLoop);
      clearInterval(bugSpawnInterval);
    };
  }, [socket, room, player]);

  return (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-white"
      />
    </div>
  );
}

export default Battleground;
