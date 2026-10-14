import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Pepito Realtime Kitchen Gateway:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from Realtime Gateway');
    });
  }
  return socket;
}

