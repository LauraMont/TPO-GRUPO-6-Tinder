import { Flame, Calendar, MessageCircle, User } from 'lucide-react';
import './bottomNav.css';

export default function BottomNav({ activeTab, onTabChange }) {
  const navItems = [
    { id: 'swipe', icon: Flame },
    { id: 'events', icon: Calendar },
    { id: 'chat', icon: MessageCircle },
    { id: 'profile', icon: User }
  ];

  return (
    <div className="bottom-nav-container">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button 
            key={item.id}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-label={item.id}
          >
            {/* El fondo brillante circular para el ícono activo */}
            {isActive && <div className="active-glow"></div>}
            
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={`nav-icon ${isActive ? 'text-active' : 'text-inactive'}`} 
            />
          </button>
        );
      })}
    </div>
  );
}