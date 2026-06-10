import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Send } from 'lucide-react';
import './Chat.css';

const AVATAR_COLORS = ['#ff4f87','#9b5de5','#00d9b4','#ff6d5a','#f7b731','#0095ff'];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [matchName, setMatchName] = useState('');
  const bottomRef = useRef(null);

  // Cargar nombre del match desde localStorage si fue guardado
  useEffect(() => {
    const saved = localStorage.getItem(`match_${userId}`);
    if (saved) setMatchName(saved);
    else setMatchName(userId);

    // Cargar mensajes guardados localmente
    const savedMsgs = localStorage.getItem(`chat_${userId}`);
    if (savedMsgs) setMessages(JSON.parse(savedMsgs));
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(`chat_${userId}`, JSON.stringify(updated));
    setInput('');

    // Simular respuesta después de 1 segundo
    setTimeout(() => {
      const responses = [
        '¡Hola! 😊',
        '¡Qué bueno que conectamos!',
        '¿Cómo estás?',
        'Me alegra que hayas dado like 😄',
        '¿Qué planes tenés para el finde?',
      ];
      const reply = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'them',
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      localStorage.setItem(`chat_${userId}`, JSON.stringify(withReply));
    }, 1000);
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/chats')}>
          <ChevronLeft size={22} />
        </button>
        <div className="chat-header-avatar" style={{ background: getColor(matchName) }}>
          {matchName?.[0]?.toUpperCase()}
        </div>
        <div className="chat-header-info">
          <span className="chat-header-name">{matchName}</span>
          <span className="chat-header-status">En línea</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-match-banner">
              <span>🎉</span>
              <p>¡Es un match! Rompan el hielo</p>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`msg-row ${msg.sender === 'me' ? 'me' : 'them'}`}>
            {msg.sender === 'them' && (
              <div className="msg-avatar" style={{ background: getColor(matchName) }}>
                {matchName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="msg-bubble">
              <p>{msg.text}</p>
              <span className="msg-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribí un mensaje..."
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