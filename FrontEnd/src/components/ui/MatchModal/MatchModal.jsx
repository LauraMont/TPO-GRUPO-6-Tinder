import './matchModal.css';

export default function MatchModal({ currentUser, matchedUser, onClose, onMessage }) {
  const photo = matchedUser?.photos?.[0] || '';
  return (
    <div className="match-overlay">
      <div className="match-container">
        <div className="match-hearts">❤️</div>
        <h1 className="match-title">¡ES UN MATCH!</h1>
        <p className="match-sub">Tú y {matchedUser?.name || 'este perfil'} se han gustado mutuamente</p>

        <div className="match-cards">
          <div className="match-card blue">
            <div className="match-avatar">{currentUser?.initials || 'Y'}</div>
          </div>
          <div className="match-card-overlap">
            <div className="match-heart-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          <div className="match-card pink" style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!photo && <div className="match-avatar">{matchedUser?.name?.[0]?.toUpperCase() || '?'}</div>}
          </div>
        </div>

        <div className="match-actions">
          <button className="btn-message" onClick={onMessage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Enviar un mensaje
          </button>
          <button className="btn-keep" onClick={onClose}>Seguir deslizando</button>
        </div>
      </div>
    </div>
  );
}
