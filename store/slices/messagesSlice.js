// store/slices/messagesSlice.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.195:5000/api';

// Safe getter — never throws if the store isn't ready
const getAuthToken = () => {
  try {
    const { useAppStore } = require('../useAppStore');
    return useAppStore?.getState?.()?.authToken || null;
  } catch {
    return null;
  }
};

// 🔥 Helper to sort conversations by the newest timestamp
const sortConversations = (conversations) => {
  return [...conversations].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.time || 0).getTime();
    const dateB = new Date(b.updatedAt || b.time || 0).getTime();
    return dateB - dateA; // Newest first
  });
};

export const createMessagesSlice = (set, get) => ({
  // State
  conversations: [],       // [{ id, name, avatar, lastMessage, time, unreadCount, isOnline, lastMessageType, updatedAt, isArchived }]
  messages: {},            // { [chatId]: [{ id, text, sender, time, date, seen }] }
  messagesLoading: false,
  messagesError: null,

  // ---------- Conversations list ----------
  loadConversations: async () => {
    set({ messagesLoading: true, messagesError: null });

    const token = getAuthToken();

    if (token) {
      try {
        const response = await axios.get(`${API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = response.data?.conversations || [];
        // Sort them on load
        set({ conversations: sortConversations(list), messagesLoading: false });
        return { success: true, synced: true };
      } catch (err) {
        console.log(
          '⚠️ loadConversations failed (keeping local):',
          err.response?.data || err.message
        );
      }
    }

    // No token OR backend failed — keep whatever's local
    set({ messagesLoading: false });
    return { success: true, synced: false };
  },

  // ---------- Per-conversation messages ----------
  loadMessages: async (chatId) => {
    if (!chatId) return { success: false };

    set({ messagesLoading: true, messagesError: null });

    const token = getAuthToken();

    if (token) {
      try {
        const response = await axios.get(
          `${API_URL}/conversations/${chatId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list = response.data?.messages || [];
        set((state) => ({
          messages: { ...state.messages, [chatId]: list },
          messagesLoading: false,
        }));
        return { success: true, synced: true };
      } catch (err) {
        console.log(
          `⚠️ loadMessages(${chatId}) failed (keeping local):`,
          err.response?.data || err.message
        );
      }
    }

    set({ messagesLoading: false });
    return { success: true, synced: false };
  },

  // ---------- Send a message (local-first) ----------
  sendMessage: async (chatId, text, senderName = 'You') => {
    if (!chatId || !text?.trim()) return { success: false };

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      sender: 'me',
      time: timeString,
      date: 'Today',
      seen: false,
      createdAt: now.toISOString(),
    };

    // 1. Append to the per-chat messages
    set((state) => {
      const existing = state.messages[chatId] || [];
      const updatedMessages = {
        ...state.messages,
        [chatId]: [...existing, newMessage],
      };

      // 2. Update the conversation row's preview and timestamp
      const updatedConversations = state.conversations.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMessage.text,
              time: timeString,
              lastMessageType: 'text',
              updatedAt: now.toISOString(),
            }
          : c
      );

      // 🔥 3. Sort so the most recent chat goes to the top
      const sortedConversations = sortConversations(updatedConversations);

      return {
        messages: updatedMessages,
        conversations: sortedConversations,
      };
    });

    // 3. Best-effort backend sync
    const token = getAuthToken();
    if (token) {
      try {
        await axios.post(
          `${API_URL}/conversations/${chatId}/messages`,
          { text: newMessage.text },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Mark as seen by server
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map((m) =>
              m.id === newMessage.id ? { ...m, seen: true } : m
            ),
          },
        }));
      } catch (err) {
        console.log(
          '⚠️ sendMessage backend sync failed (local kept):',
          err.response?.data || err.message
        );
      }
    }

    return { success: true, message: newMessage };
  },

  // ---------- Mark read ----------
  markConversationRead: (chatId) => {
    if (!chatId) return;
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  // 🔥 ---------- Archive Conversation ----------
  archiveConversation: (chatId) => {
    if (!chatId) return;
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === chatId ? { ...c, isArchived: true } : c
      ),
    }));
  },

  // 🔥 ---------- Unarchive Conversation ----------
  unarchiveConversation: (chatId) => {
    if (!chatId) return;
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === chatId ? { ...c, isArchived: false } : c
      ),
    }));
  },

  // 🔥 ---------- Delete Conversation ----------
  deleteConversation: (chatId) => {
    if (!chatId) return;
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[chatId]; // Remove the messages too

      return {
        conversations: state.conversations.filter((c) => c.id !== chatId),
        messages: newMessages,
      };
    });
  },

  // ---------- Clear chat ----------
  clearChat: (chatId) => {
    if (!chatId) return;
    set((state) => ({
      messages: { ...state.messages, [chatId]: [] },
      conversations: state.conversations.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: '', time: '', updatedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  // ---------- Ensure a conversation exists (from PropertyDetail "Contact Agent") ----------
  ensureConversation: ({ chatId, userName, avatar, propertyTitle }) => {
    if (!chatId) return;
    const existing = get().conversations.find((c) => c.id === chatId);
    if (existing) return;

    set((state) => {
      const newConversation = {
        id: chatId,
        name: userName || 'Host',
        avatar: avatar || 'https://i.pravatar.cc/150?img=1',
        lastMessage: propertyTitle 
          ? `Hi, I'm interested in "${propertyTitle}"` 
          : 'Start a conversation',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 1, 
        isOnline: true,
        lastMessageType: 'text',
        updatedAt: new Date().toISOString(),
        isArchived: false,
        propertyTitle: propertyTitle || null, 
      };

      // Add to the beginning and sort to be safe
      const updatedList = [newConversation, ...state.conversations];
      
      return {
        conversations: sortConversations(updatedList),
      };
    });
  },
});