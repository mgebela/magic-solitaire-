import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function getMultiplayerSocket(accessToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/multiplayer`, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectMultiplayerSocket(): void {
  socket?.disconnect();
  socket = null;
}
