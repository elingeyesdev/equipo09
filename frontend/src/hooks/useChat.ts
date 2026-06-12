import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../api/chat.api';

// En desarrollo nos conectamos directo al puerto del backend (3000) para evitar problemas del proxy de Vite
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

interface UseChatOptions {
  conversationId: string | null;
  onNewMessage?: (msg: Message) => void;
  onConversationUpdated?: (data: { conversationId: string; lastMessage: Message }) => void;
}

export function useChat({ conversationId, onNewMessage, onConversationUpdated }: UseChatOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ─────────────────────────────────────────────────────────
  // Inicializar socket una sola vez
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🟢 Chat WebSocket conectado');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔴 Chat WebSocket desconectado');
    });

    socket.on('error', (err: { message: string }) => {
      console.error('⚠️ Chat error:', err.message);
    });

    // Nuevos mensajes
    socket.on('new_message', (msg: Message) => {
      onNewMessage?.(msg);
    });

    // Actualización de conversación (para el sidebar)
    socket.on('conversation_updated', (data: { conversationId: string; lastMessage: Message }) => {
      onConversationUpdated?.(data);
    });

    // Indicador de escritura
    socket.on('user_typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
      // Auto-limpiar después de 3s si no llega stop_typing
      const existing = typingTimers.current.get(userId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }, 3000);
      typingTimers.current.set(userId, timer);
    });

    socket.on('user_stop_typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      const timer = typingTimers.current.get(userId);
      if (timer) {
        clearTimeout(timer);
        typingTimers.current.delete(userId);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      // Limpiar timers
      typingTimers.current.forEach((t) => clearTimeout(t));
      typingTimers.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez al montar

  // ─────────────────────────────────────────────────────────
  // Unirse a sala cuando cambia la conversación activa
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    socket.emit('join_room', { conversationId });

    return () => {
      socket.emit('leave_room', { conversationId });
      setTypingUsers(new Set());
    };
  }, [conversationId]);

  // ─────────────────────────────────────────────────────────
  // Acciones
  // ─────────────────────────────────────────────────────────

  const sendMessage = useCallback((convId: string, content: string) => {
    socketRef.current?.emit('send_message', { conversationId: convId, content });
  }, []);

  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback((convId: string) => {
    socketRef.current?.emit('typing', { conversationId: convId });
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { conversationId: convId });
    }, 1500);
  }, []);

  const emitMarkAsRead = useCallback((convId: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId: convId });
  }, []);

  return {
    connected,
    typingUsers,
    sendMessage,
    emitTyping,
    emitMarkAsRead,
  };
}
