import { MessageCircle } from 'lucide-react';
import './matchModal.css'; // O agrega estos estilos en tu swipe.css

export default function MatchModal({ currentUser, matchedUser, onClose, onMessage }) {
  const matchedPhoto = (matchedUser.photos && matchedUser.photos[0]) || '';

  return (
    <div className="match-modal-overlay">
      <div className="match-modal-container">
        
        <h1 className="match-title">¡ES UN MATCH!</h1>
        <p className="match-subtitle">
          Tú y {matchedUser.name || 'este perfil'} se han gustado mutuamente
        </p>

        <div className="match-cards-container">
          {/* Carta de Laura (Azul) */}
          <div className="match-card current-user-card">
            <div className="avatar-placeholder">{currentUser.initials}</div>
          </div>

          {/* Carta del otro perfil (Roja/Naranja) */}
          <div className="match-card matched-user-card" 
               style={{ backgroundImage: `url(${matchedPhoto})` }}>
            {!matchedPhoto && <div className="avatar-placeholder">?</div>}
            
            {/* Corazón en el centro */}
            <div className="match-heart-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" className="heart-icon">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="match-actions">
          <button className="btn-message" onClick={onMessage}>
            <MessageCircle size={20} />
            Enviar un mensaje
          </button>
          <button className="btn-keep-swiping" onClick={onClose}>
            Seguir deslizando
          </button>
        </div>

      </div>
    </div>
  );
}