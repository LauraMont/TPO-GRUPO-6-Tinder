import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import swipeApi from '../api/swipeApi';
import BottomNav from '../components/ui/BottomNav/BottomNav';
import { Search } from 'lucide-react';
import './Chats.css';

const AVATAR_COLORS = ['#ff4f87','#9b5de5','#00d9b4','#ff6d5a','#f7b731','#0095ff'];

export default function Chats() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    (async () => {
      try {
        const data = await swipeApi.getMatches();
        const list = data?.matches || (Array.isArray(data) ? data : []);
        setMatches(list);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const getInitials = (name) => name?.[0]?.toUpperCase() || '?';

  const openChat = (m) => {
    localStorage.setItem(`match_${m.userId || m.id}`, m.name || m.userId || m.id);
    navigate(`/chat/${m.userId || m.id}`);
  };

  return (
    <div className="chats-page">
      <div className="chats-topbar">
        <h1>Mensajes</h1>
        <button className="topbar-icon-btn"><Search size={20} /></button>
      </div>

      <div className="chats-content">
        {/* Matches row */}
        <div className="matches-section">
          <p className="section-label">Nuevos Matches</p>
          <div className="matches-row">
            {loading ? (
              <div className="matches-empty">Cargando...</div>
            ) : matches.length === 0 ? (
              <div className="matches-empty">Aún no tienes matches</div>
            ) : (
              matches.slice(0, 6).map((m, i) => (
                <div
                  key={m.id || m.userId || i}
                  className="match-bubble"
                  onClick={() => openChat(m)}
                  style={{ cursor: 'pointer' }}
                >
                  {m.photos?.[0] ? (
                    <img src={m.photos[0]} alt={m.name} className="match-avatar-img" />
                  ) : (
                    <div className="match-avatar-circle" style={{ background: getColor(m.name) }}>
                      {getInitials(m.name)}
                    </div>
                  )}
                  <span className="match-name">{m.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className="convos-section">
          <p className="section-label">Conversaciones</p>
          {loading ? (
            <div className="chats-loading"><div className="state-spinner" /></div>
          ) : matches.length === 0 ? (
            <div className="chats-empty">
              <p>¡Conseguí más matches para chatear!</p>
            </div>
          ) : (
            <div className="convos-list">
              {matches.map((m, i) => (
                <div
                  key={m.id || m.userId || i}
                  className="convo-item"
                  onClick={() => openChat(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="convo-avatar-wrap">
                    {m.photos?.[0] ? (
                      <img src={m.photos[0]} alt={m.name} className="convo-avatar-img" />
                    ) : (
                      <div className="convo-avatar-circle" style={{ background: getColor(m.name) }}>
                        {getInitials(m.name)}
                      </div>
                    )}
                    <div className="convo-online-dot" />
                  </div>
                  <div className="convo-info">
                    <span className="convo-name">{m.name}{m.age ? `, ${m.age}` : ''}</span>
                    <span className="convo-preview">
                      {localStorage.getItem(`chat_${m.userId || m.id}`)
                        ? JSON.parse(localStorage.getItem(`chat_${m.userId || m.id}`)).slice(-1)[0]?.text || '¡Es un match! Dile hola 👋'
                        : '¡Es un match! Dile hola 👋'}
                    </span>
                  </div>
                  <div className="convo-meta">
                    <span className="convo-time">Hoy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}