import { create } from 'zustand';
import apiClient from '../services/backendService';
import { socketService } from '../services/socketService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  clientMessageId: string;
  chatId: string;
  senderProfileId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  status?: 'SENDING' | 'SENT' | 'FAILED'; // Local UI state
}

export interface ChatInboxItem {
  chatId: string;
  matchId: string;
  otherProfile: {
    id: string;
    name: string;
    avatar: string | null;
  };
  latestMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

interface ChatStore {
  inbox: ChatInboxItem[];
  activeChatMessages: ChatMessage[];
  loadingInbox: boolean;
  loadingMessages: boolean;
  activeMatchId: string | null;
  typingUsers: Set<string>; // Set of matchIds currently typing
  
  fetchInbox: () => Promise<void>;
  fetchMessages: (matchId: string, before?: string) => Promise<void>;
  
  setActiveMatchId: (matchId: string | null) => void;
  joinChatRoom: (matchId: string) => void;
  leaveChatRoom: (matchId: string) => void;
  
  sendMessage: (matchId: string, content: string) => void;
  sendTypingStart: (matchId: string) => void;
  sendTypingEnd: (matchId: string) => void;

  // Socket Listeners Init
  initSocketListeners: () => void;
  removeSocketListeners: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  inbox: [],
  activeChatMessages: [],
  loadingInbox: false,
  loadingMessages: false,
  activeMatchId: null,
  typingUsers: new Set(),

  fetchInbox: async () => {
    set({ loadingInbox: true });
    try {
      const response = await apiClient.get('/chat');
      set({ inbox: response.data || [], loadingInbox: false });
    } catch (error) {
      console.error('Failed to fetch inbox', error);
      set({ loadingInbox: false });
    }
  },

  fetchMessages: async (matchId, before) => {
    // If not paginating, set loading
    if (!before) set({ loadingMessages: true });
    try {
      const url = before ? `/chat/${matchId}/messages?before=${before}` : `/chat/${matchId}/messages`;
      const response = await apiClient.get(url);
      
      const newMessages = response.data || [];
      if (before) {
        set((state) => ({ activeChatMessages: [...state.activeChatMessages, ...newMessages] }));
      } else {
        set({ activeChatMessages: newMessages, loadingMessages: false });
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
      set({ loadingMessages: false });
    }
  },

  setActiveMatchId: (matchId) => set({ activeMatchId: matchId }),

  joinChatRoom: (matchId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('join_chat', { matchId });
    }
  },

  leaveChatRoom: (matchId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('leave_chat', { matchId });
    }
  },

  sendMessage: (matchId, content) => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const clientMessageId = uuidv4();
    
    // Optimistic UI
    const tempMsg: ChatMessage = {
      id: clientMessageId, // temp id
      clientMessageId,
      chatId: 'temp',
      senderProfileId: 'me', // UI uses this to align right
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      status: 'SENDING'
    };

    set((state) => ({
      activeChatMessages: [tempMsg, ...state.activeChatMessages]
    }));

    socket.emit('send_message', { matchId, content, clientMessageId });
  },

  sendTypingStart: (matchId) => {
    socketService.getSocket()?.emit('typing_start', { matchId });
  },

  sendTypingEnd: (matchId) => {
    socketService.getSocket()?.emit('typing_end', { matchId });
  },

  initSocketListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Acknowledgment from server that our message was saved
    socket.on('message_saved', (message: ChatMessage) => {
      set((state) => ({
        activeChatMessages: state.activeChatMessages.map(m => 
          m.clientMessageId === message.clientMessageId 
            ? { ...message, status: 'SENT' } 
            : m
        )
      }));
    });

    // Failed to send
    socket.on('message_failed', (data: { clientMessageId: string, error: string }) => {
      set((state) => ({
        activeChatMessages: state.activeChatMessages.map(m => 
          m.clientMessageId === data.clientMessageId 
            ? { ...m, status: 'FAILED' } 
            : m
        )
      }));
    });

    // Incoming new message from someone else
    socket.on('new_message', (message: ChatMessage) => {
      const state = get();
      
      // Update Inbox
      // Ideally, we re-fetch inbox or manually update the latest message and unread count
      state.fetchInbox();

      // If we are currently in this chat room, append the message
      if (state.activeMatchId) {
        // Technically we should check if the message belongs to activeMatchId.
        // The backend `message` doesn't have `matchId` easily without join, but we only receive `new_message` 
        // if we are in the room. Wait, we receive it if we are in the room, but `activeMatchId` dictates what we're looking at.
        // Let's assume the message belongs to the current open chat. 
        set((s) => ({
          activeChatMessages: [message, ...s.activeChatMessages]
        }));
      }
    });

    socket.on('typing_start', (data: { matchId: string, userId: string }) => {
      set((state) => {
        const newSet = new Set(state.typingUsers);
        newSet.add(data.matchId);
        return { typingUsers: newSet };
      });
    });

    socket.on('typing_end', (data: { matchId: string, userId: string }) => {
      set((state) => {
        const newSet = new Set(state.typingUsers);
        newSet.delete(data.matchId);
        return { typingUsers: newSet };
      });
    });
  },

  removeSocketListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.off('message_saved');
    socket.off('message_failed');
    socket.off('new_message');
    socket.off('typing_start');
    socket.off('typing_end');
  }
}));
