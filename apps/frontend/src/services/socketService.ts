import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../hooks/useAuthStore';

// Determine backend URL (fallback for local testing)
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_ENV === 'prod'
    ? process.env.EXPO_PUBLIC_BACKEND_PROD_URL
    : process.env.EXPO_PUBLIC_BACKEND_TEST_URL || 'http://192.168.1.10:3000';

// Strip /api from the URL because Socket.io treats paths as namespaces, 
// and NestJS WebSockets bind to the root '/' regardless of global REST prefix.
const SOCKET_URL = (BACKEND_URL as string).replace(/\/api\/?$/, '');

class SocketService {
  private socket: Socket | null = null;
  
  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.warn('SocketService: No token available. Cannot connect.');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('SocketService: Connected to ChatGateway', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('SocketService: Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketService: Connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('SocketService: Disconnected manually');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
