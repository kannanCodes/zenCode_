import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import api from '../../lib/axios';
import type { ChatMessage } from '../../types/chat';

interface SessionChatProps {
  roomId: string;
  socketRef: React.RefObject<Socket | null>;
  currentUserId: string;
}

const SessionChat = ({ roomId, socketRef, currentUserId }: SessionChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing chat history from REST on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data?.data || []);
      } catch (err) {
        console.error('[Chat] Failed to load history:', err);
      }
    };
    loadHistory();
  }, [roomId]);

  // Register socket listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      // Mark as read
      socket.emit('chat:message-read', { roomId });
    };

    const handleTypingStart = ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setTypingUserId(userId);
    };

    const handleTypingStop = () => {
      setTypingUserId(null);
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:typing-start', handleTypingStart);
    socket.on('chat:typing-stop', handleTypingStop);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:typing-start', handleTypingStart);
      socket.off('chat:typing-stop', handleTypingStop);
    };
  }, [socketRef, roomId, currentUserId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUserId]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current) return;

    socketRef.current.emit('chat:send-message', { roomId, content: trimmed });
    socketRef.current.emit('chat:typing-stop', { roomId });
    setInput('');
    setIsTyping(false);
  }, [input, roomId, socketRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const socket = socketRef.current;
    if (!socket) return;

    if (!isTyping) {
      socket.emit('chat:typing-start', { roomId });
      setIsTyping(true);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('chat:typing-stop', { roomId });
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-[#111111] border-l border-[#272b3a]">
      {/* Chat Header */}
      <div className="h-12 flex items-center px-4 border-b border-[#272b3a] shrink-0">
        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-xs mt-8">No messages yet. Say hi!</p>
        )}
        {messages.map(msg => {
          const isOwn = msg.senderId._id === currentUserId;
          return (
            <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-600 mb-1 px-1">
                {isOwn ? 'You' : (msg.senderId.fullName || 'Participant')} • {formatTime(msg.createdAt)}
              </span>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                    : 'bg-[#1a1d26] text-gray-200 rounded-bl-sm border border-[#272b3a]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUserId && (
          <div className="flex items-start">
            <div className="bg-[#1a1d26] border border-[#272b3a] rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[#272b3a] p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-[#1a1d26] border border-[#272b3a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 flex items-center justify-center bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SessionChat;
