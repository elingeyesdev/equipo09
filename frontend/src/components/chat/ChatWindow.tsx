import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, ArrowLeft, Rocket, Loader2 } from 'lucide-react';
import type { Conversation, Message } from '../../api/chat.api';
import { getMessages } from '../../api/chat.api';
import { getImageUrl } from '../../utils/image.utils';
import { Link } from 'react-router-dom';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  typingUsers: Set<string>;
  onBack: () => void;
  onSend: (conversationId: string, content: string) => void;
  onTyping: (conversationId: string) => void;
  onMarkAsRead: (conversationId: string) => void;
  newIncomingMessage: Message | null; // mensaje nuevo llegado por WS
}

function AvatarFallback({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
  const cls = size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shrink-0 ${cls}`}
    >
      {initials || '?'}
    </div>
  );
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Grupo mensajes por día para mostrar separadores de fecha
function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      groups.push({ date: dateKey, messages: [msg] });
    }
  }
  return groups;
}

export function ChatWindow({
  conversation,
  currentUserId,
  typingUsers,
  onBack,
  onSend,
  onTyping,
  onMarkAsRead,
  newIncomingMessage,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTypingIndicatorVisible = typingUsers.size > 0;

  const otherUser = conversation.otherUser;
  const avatarUrl = getImageUrl(otherUser.avatar);

  // ── Carga inicial de mensajes ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setLoading(true);
    setHasMore(true);

    getMessages(conversation.id, 50)
      .then((msgs) => {
        if (!cancelled) {
          setMessages(msgs);
          setLoading(false);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
          onMarkAsRead(conversation.id);
        }
      })
      .catch(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // ── Nuevo mensaje por WebSocket ────────────────────────────
  useEffect(() => {
    if (!newIncomingMessage) return;
    if (newIncomingMessage.conversationId !== conversation.id) return;

    setMessages((prev) => {
      // Evitar duplicados
      if (prev.some((m) => m.id === newIncomingMessage.id)) return prev;
      return [...prev, newIncomingMessage];
    });
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // Marcar como leído si el mensaje es del otro usuario
    if (newIncomingMessage.senderId !== currentUserId) {
      onMarkAsRead(conversation.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newIncomingMessage]);

  // ── Scroll automático al escribir ─────────────────────────
  useEffect(() => {
    if (isTypingIndicatorVisible) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTypingIndicatorVisible]);

  // ── Cargar más mensajes (scroll hacia arriba) ──────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    const firstId = messages[0]?.id;
    if (!firstId) return;

    setLoadingMore(true);
    const prev = containerRef.current?.scrollTop ?? 0;
    const prevHeight = containerRef.current?.scrollHeight ?? 0;

    try {
      const older = await getMessages(conversation.id, 30, firstId);
      if (older.length < 30) setHasMore(false);
      setMessages((cur) => [...older, ...cur]);
      // Mantener la posición de scroll después de agregar mensajes arriba
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const newHeight = containerRef.current.scrollHeight;
          containerRef.current.scrollTop = prev + (newHeight - prevHeight);
        }
      });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, messages, conversation.id]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop < 80) loadMore();
  }, [loadMore]);

  // ── Enviar mensaje ─────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    onSend(conversation.id, trimmed);
    setText('');
    setSending(false);

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [text, sending, onSend, conversation.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(conversation.id);
  };

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-full bg-[#f4f7f4]">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100 shadow-sm shrink-0">
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
        </button>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={otherUser.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <AvatarFallback name={otherUser.fullName} />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-slate-800 truncate leading-tight">
            {otherUser.fullName}
          </p>
          {isTypingIndicatorVisible ? (
            <p className="text-[12px] text-emerald-600 font-semibold animate-pulse">
              Escribiendo...
            </p>
          ) : (
            <p className="text-[12px] text-slate-400 font-medium">
              {otherUser.email}
            </p>
          )}
        </div>

        {conversation.campaignId && (
          <Link
            to={`/campaign/${conversation.campaignId}`}
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl no-underline transition-colors max-w-[160px] truncate"
          >
            <Rocket size={13} strokeWidth={2.5} />
            <span className="truncate">{conversation.campaignTitle ?? 'Ver campaña'}</span>
          </Link>
        )}
      </header>

      {/* ── Área de mensajes ─────────────────────────────── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1fae5 transparent' }}
      >
        {/* Botón cargar más */}
        {hasMore && !loading && messages.length >= 10 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-[12px] font-bold text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 rounded-full px-4 py-1.5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
              {loadingMore ? 'Cargando...' : 'Ver mensajes anteriores'}
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-[13px] text-slate-400 font-medium">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-300">
              <Send size={28} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-bold text-slate-400">¡Sé el primero en escribir!</p>
            <p className="text-[12px] text-slate-300">
              Inicia la conversación con {otherUser.firstName ?? otherUser.email}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.date}>
              {/* Separador de fecha */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shrink-0">
                  {formatDateSeparator(group.messages[0].createdAt)}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {group.messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const prevMsg = group.messages[idx - 1];
                const isSameSender = prevMsg?.senderId === msg.senderId;
                const showAvatar = !isMe && !isSameSender;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isSameSender ? 'mt-1' : 'mt-4'}`}
                  >
                    {/* Avatar del otro */}
                    {!isMe && (
                      <div className="shrink-0 w-8">
                        {showAvatar ? (
                          avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <AvatarFallback name={otherUser.fullName} size="sm" />
                          )
                        ) : null}
                      </div>
                    )}

                    {/* Burbuja */}
                    <div
                      className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words
                          ${isMe
                            ? 'bg-gradient-to-br from-[#2e7d32] to-[#1b5e20] text-white rounded-[18px] rounded-br-[4px] shadow-md shadow-emerald-900/10'
                            : 'bg-white text-slate-800 rounded-[18px] rounded-bl-[4px] shadow-sm border border-slate-100'
                          }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                        {formatTime(msg.createdAt)}
                        {msg.isEdited && ' · editado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Indicador de escritura */}
        {isTypingIndicatorVisible && (
          <div className="flex items-end gap-2 mt-4">
            <div className="shrink-0 w-8">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <AvatarFallback name={otherUser.fullName} size="sm" />
              )}
            </div>
            <div className="bg-white rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-400 inline-block animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3">
        <div className="flex items-end gap-3 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-emerald-300 transition-colors">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Escríbele a ${otherUser.firstName ?? 'este contacto'}...`}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[14px] text-slate-800 placeholder:text-slate-400 font-medium max-h-[140px] py-1 leading-relaxed"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="shrink-0 w-9 h-9 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer border-none shadow-md shadow-emerald-900/20"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
