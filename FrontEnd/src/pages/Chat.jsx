import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const AVATAR_COLORS = ['#ff4f87', '#9b5de5', '#00d9b4', '#ff6d5a', '#f7b731', '#0095ff'];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const toDisplayMessage = (message, currentUserId) => ({
  id: message.id,
  text: message.text,
  sender: message.sender_id === currentUserId ? 'me' : 'them',
  time: new Date(message.created_at).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }),
});
const mergeMessages = (current, incoming) => {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messagesById.set(message.id, message));
  return [...messagesById.values()];
};

export default function Chat() {
  const { userId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [matchName, setMatchName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Conectando...');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMatchName(localStorage.getItem(`match_${userId}`) || userId);
  }, [userId]);

  useEffect(() => {
    if (!token) return undefined;

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    const wsBase = apiBase.replace(/^http/, 'ws');
    let reconnectTimer;
    let syncTimer;
    let stopped = false;

    const connect = () => {
      setConnectionStatus('Conectando...');
      const socket = new WebSocket(
        `${wsBase}/ws/chat/${encodeURIComponent(userId)}?token=${encodeURIComponent(token)}`,
      );
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') {
          setConnectionStatus(payload.other_user_online ? 'En linea' : 'Conectado');
        } else if (payload.type === 'presence' && payload.user_id === userId) {
          setConnectionStatus(payload.online ? 'En linea' : 'Conectado');
        } else if (payload.type === 'history') {
          const history = payload.messages.map((message) => toDisplayMessage(message, user?.sub));
          setMessages((current) => mergeMessages(current, history));
        } else if (payload.type === 'message') {
          setMessages((current) => mergeMessages(current, [toDisplayMessage(payload, user?.sub)]));
        }
      };
      socket.onopen = () => {
        window.clearInterval(syncTimer);
        syncTimer = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'sync' }));
          }
        }, 2000);
      };
      socket.onerror = () => setConnectionStatus('Error de conexion');
      socket.onclose = (event) => {
        window.clearInterval(syncTimer);
        if (event.code === 1008) {
          setConnectionStatus('Chat no autorizado');
          return;
        }
        if (!stopped) {
          setConnectionStatus('Reconectando...');
          reconnectTimer = window.setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      window.clearInterval(syncTimer);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [token, user?.sub, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ text }));
    setInput('');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          <ChevronLeft size={22} />
        </button>
        <div className="chat-header-avatar" style={{ background: getColor(matchName) }}>
          {matchName?.[0]?.toUpperCase()}
        </div>
        <div className="chat-header-info">
          <span className="chat-header-name">{matchName}</span>
          <span className="chat-header-status">{connectionStatus}</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-match-banner">
              <p>Es un match. Inicien la conversacion.</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`msg-row ${message.sender === 'me' ? 'me' : 'them'}`}>
            {message.sender === 'them' && (
              <div className="msg-avatar" style={{ background: getColor(matchName) }}>
                {matchName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="msg-bubble">
              <p>{message.text}</p>
              <span className="msg-time">{message.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
          placeholder="Escribi un mensaje..."
          className="chat-input"
        />
        <button
          className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
          onClick={sendMessage}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
