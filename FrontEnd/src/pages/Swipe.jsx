import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import swipeApi from '../api/swipeApi';
import BottomNav from '../components/ui/BottomNav/BottomNav';
import MatchModal from '../components/ui/MatchModal/MatchModal';
import { MapPin, Info, X, Heart } from 'lucide-react';
import './Swipe.css';

export default function Swipe() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Drag state
  const [drag, setDrag] = useState({ active: false, startX: 0, dx: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    (async () => {
      setLoading(true);
      try {
        const data = await swipeApi.getFeed({ debug: true });
        const list = data?.profiles || (Array.isArray(data) ? data : []);
        setProfiles(list);
      } catch (err) {
        setError(err.message || 'Error cargando perfiles');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const currentProfile = profiles[index];

  const handleLike = async () => {
    if (!currentProfile) return;
    try {
      const res = await swipeApi.like(currentProfile.id || currentProfile.userId);
      if (res?.is_match) {
        setMatchedProfile(currentProfile);
      } else {
        setIndex(i => i + 1);
      }
    } catch { setIndex(i => i + 1); }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    try { await swipeApi.pass(currentProfile.id || currentProfile.userId); } catch {}
    setIndex(i => i + 1);
  };

  const handleCloseMatch = () => { setMatchedProfile(null); setIndex(i => i + 1); };
  const handleGoChat = () => { setMatchedProfile(null); navigate('/chats'); };

  // Drag handlers
  const onMouseDown = (e) => setDrag({ active: true, startX: e.clientX, dx: 0 });
  const onMouseMove = (e) => {
    if (!drag.active) return;
    setDrag(d => ({ ...d, dx: e.clientX - d.startX }));
  };
  const onMouseUp = () => {
    if (drag.dx > 80) handleLike();
    else if (drag.dx < -80) handlePass();
    setDrag({ active: false, startX: 0, dx: 0 });
  };

  const photoUrl = currentProfile?.photos?.[0] || currentProfile?.photo || '';
  const displayName = currentProfile?.name || currentProfile?.username || 'Usuario';
  const displayAge = currentProfile?.age || '';
  const displayBio = currentProfile?.bio || currentProfile?.description || '';
  const displayInterests = currentProfile?.interests || currentProfile?.tags || [];
  const displayLocation = currentProfile?.location || currentProfile?.city || 'Buenos Aires';

  const cardStyle = drag.active && drag.dx !== 0 ? {
    transform: `rotate(${drag.dx * 0.04}deg) translateX(${drag.dx}px)`,
    transition: 'none',
  } : {};
  const likeOpacity = drag.dx > 20 ? Math.min((drag.dx - 20) / 60, 1) : 0;
  const passOpacity = drag.dx < -20 ? Math.min((-drag.dx - 20) / 60, 1) : 0;

  return (
    <div className="swipe-page">
      {/* Topbar */}
      <div className="swipe-topbar">
        <span className="swipe-logo">TINDERLIKE</span>
        <button className="topbar-menu" onClick={() => navigate('/perfil')}>
          <span /><span /><span />
        </button>
      </div>

      {/* Content */}
      <div className="swipe-content">
        {loading && (
          <div className="swipe-state">
            <div className="state-spinner" />
            <p>Cargando perfiles...</p>
          </div>
        )}
        {!loading && error && (
          <div className="swipe-state">
            <p className="state-error">{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        )}
        {!loading && !error && !currentProfile && (
          <div className="swipe-state">
            <div className="state-empty-icon">🎉</div>
            <h3>¡Ya viste todos!</h3>
            <p>Vuelve más tarde para ver nuevos perfiles</p>
          </div>
        )}
        {!loading && !error && currentProfile && (
          <div
            ref={cardRef}
            className="profile-card"
            style={cardStyle}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Like/Nope indicators */}
            <div className="swipe-indicator like" style={{ opacity: likeOpacity }}>
              <Heart fill="white" size={32} />
              <span>LIKE</span>
            </div>
            <div className="swipe-indicator nope" style={{ opacity: passOpacity }}>
              <X size={32} />
              <span>NOPE</span>
            </div>

            {/* Photo */}
            <div
              className="card-photo"
              style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : 'none' }}
            >
              {!photoUrl && (
                <div className="card-photo-placeholder">
                  <span>{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="card-gradient" />
            </div>

            {/* Info */}
            {!showInfo ? (
              <div className="card-info">
                <div className="card-name-row">
                  <h2>{displayName}{displayAge ? `, ${displayAge}` : ''}</h2>
                  <div className="online-dot" />
                </div>
                <div className="card-location">
                  <MapPin size={14} />
                  <span>{displayLocation}</span>
                </div>
                <div className="card-tags">
                  {displayInterests.slice(0, 3).map((t, i) => (
                    <span key={i} className="card-tag">{t}</span>
                  ))}
                </div>
                <button className="info-btn" onClick={() => setShowInfo(true)}>
                  <Info size={18} />
                </button>
              </div>
            ) : (
              <div className="card-info card-info-expanded">
                <div className="card-name-row">
                  <h2>{displayName}{displayAge ? `, ${displayAge}` : ''}</h2>
                  <button className="info-btn active" onClick={() => setShowInfo(false)}>
                    <Info size={18} />
                  </button>
                </div>
                <p className="card-bio">{displayBio || 'Sin descripción'}</p>
                <div className="card-tags">
                  {displayInterests.map((t, i) => <span key={i} className="card-tag">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!loading && !error && currentProfile && (
        <div className="swipe-actions">
          <button className="action-btn pass" onClick={handlePass}>
            <X size={32} strokeWidth={2.5} />
          </button>
          <button className="action-btn like" onClick={handleLike}>
            <Heart size={32} fill="currentColor" />
          </button>
        </div>
      )}

      {matchedProfile && (
        <MatchModal
          currentUser={{ initials: user?.name?.[0]?.toUpperCase() || 'Y' }}
          matchedUser={matchedProfile}
          onClose={handleCloseMatch}
          onMessage={handleGoChat}
        />
      )}

      <BottomNav />
    </div>
  );
}
