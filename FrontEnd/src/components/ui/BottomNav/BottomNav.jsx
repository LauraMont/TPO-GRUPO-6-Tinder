import { useNavigate, useLocation } from 'react-router-dom';
import './bottomNav.css';

const FLAME_SVG = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C12 2 6 7.5 6 13c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-1-3.8-2.5-5.2C14.3 10.3 14 12 14 12S11 9.5 12 2z"/>
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { id: 'swipe', path: '/swipe', icon: FLAME_SVG },
    { id: 'events', path: '/eventos', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { id: 'chat', path: '/chats', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'profile', path: '/perfil', icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ];

  return (
    <div className="bottom-nav">
      {tabs.map(tab => {
        const isActive = path === tab.path || (tab.id === 'swipe' && path === '/swipe');
        return (
          <button
            key={tab.id}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {isActive && <div className="nav-glow" />}
            <span className="nav-icon">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
