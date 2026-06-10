import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../api/authApi';
import BottomNav from '../components/ui/BottomNav/BottomNav';
import { MapPin, Calendar, Users } from 'lucide-react';
import './Eventos.css';

const CATEGORIES = ['Todos', 'Fiestas', 'Talleres', 'Deportes', 'Gastronomía'];

const SAMPLE_EVENTS = [
  { id: '1', title: 'Sunset Rooftop Party', description: 'Fiesta exclusiva al aire libre con vista panorámica.', location: 'Terraza Trade Skybar, CABA', event_date: '2026-06-24T18:00:00', tags: 'Fiestas', status: 'Publicado', attendees: 45, featured: true },
  { id: '2', title: 'Cata de Vinos a Ciegas', description: 'Descubrí vinos únicos con los ojos cerrados.', location: 'Palermo Soho', event_date: '2026-06-28T20:30:00', tags: 'Gastronomía', status: 'Publicado', attendees: 18 },
  { id: '3', title: 'Trekking y Mates', description: 'Caminata grupal por la reserva ecológica.', location: 'Reserva Ecológica', event_date: '2026-07-02T10:00:00', tags: 'Deportes', status: 'Publicado', attendees: 12 },
  { id: '4', title: 'Workshop de Fotografía', description: 'Aprendé técnicas de retrato con profesionales.', location: 'Palermo Hollywood', event_date: '2026-07-10T15:00:00', tags: 'Talleres', status: 'Publicado', attendees: 9 },
];

function fmtDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} • ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} hs`;
  } catch { return dateStr; }
}

function getDay(dateStr) {
  if (!dateStr) return '';
  try { return String(new Date(dateStr).getDate()).padStart(2,'0'); } catch { return ''; }
}

function getMonth(dateStr) {
  if (!dateStr) return '';
  try {
    const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    return months[new Date(dateStr).getMonth()];
  } catch { return ''; }
}

const DAY_COLORS = ['#ff4f87','#ff6d5a','#9b5de5','#0095ff','#00d9b4','#f7b731'];

export default function Eventos() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState({});

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    (async () => {
      try {
        const data = await getEvents();
        const list = Array.isArray(data) ? data : [];
        setEvents(list.length ? list : SAMPLE_EVENTS);
      } catch {
        setEvents(SAMPLE_EVENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = category === 'Todos' ? events : events.filter(e =>
    (e.tags || '').toLowerCase().includes(category.toLowerCase())
  );

  const featured = filtered.find(e => e.featured) || filtered[0];
  const rest = filtered.filter(e => e !== featured);

  const toggleAttend = (id) => {
    setAttending(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="eventos-page">
      <div className="eventos-topbar">
        <div>
          <h1 className="eventos-title">Descubrir IRL</h1>
          <div className="eventos-location">
            <MapPin size={13} />
            <span>Buenos Aires, Argentina</span>
          </div>
        </div>
        <button className="topbar-icon-btn">
          <Calendar size={20} />
        </button>
      </div>

      {/* Category filters */}
      <div className="category-scroll">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-chip ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="eventos-content">
        {loading ? (
          <div className="eventos-loading"><div className="ev-spinner" /></div>
        ) : (
          <>
            {/* Featured event */}
            {featured && (
              <div className="featured-card">
                <div className="featured-badge">🔥 DESTACADO</div>
                <div className="featured-info">
                  <h2 className="featured-title">{featured.title}</h2>
                  <p className="featured-date">{fmtDate(featured.event_date)}</p>
                  <div className="featured-loc">
                    <MapPin size={13} />
                    <span>{featured.location}</span>
                  </div>
                  <div className="featured-attendees">
                    <div className="attendee-circles">
                      {[...Array(Math.min(3, featured.attendees || 3))].map((_, i) => (
                        <div key={i} className="att-circle" style={{ background: DAY_COLORS[i], marginLeft: i ? '-10px' : 0 }} />
                      ))}
                    </div>
                    <span className="att-count">{featured.attendees || 0}</span>
                    <span className="att-label">Ya se apuntaron</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming events */}
            {rest.length > 0 && (
              <div className="upcoming-section">
                <div className="upcoming-header">
                  <span className="section-label-lg">Próximos esta semana</span>
                  <button className="ver-todos">Ver todos</button>
                </div>
                <div className="event-list">
                  {rest.map((ev, i) => (
                    <div key={ev.id || i} className="event-item">
                      <div className="event-date-box" style={{ background: `linear-gradient(135deg, ${DAY_COLORS[(i+2)%6]}, ${DAY_COLORS[(i+3)%6]})` }}>
                        <span className="date-day">{getDay(ev.event_date)}</span>
                        <span className="date-month">{getMonth(ev.event_date)}</span>
                      </div>
                      <div className="event-info">
                        <span className="event-name">{ev.title}</span>
                        <div className="event-meta">
                          <MapPin size={11} />
                          <span>{ev.location} {ev.event_date ? `• ${String(new Date(ev.event_date).getHours()).padStart(2,'0')}:${String(new Date(ev.event_date).getMinutes()).padStart(2,'0')} hs` : ''}</span>
                        </div>
                      </div>
                      <button
                        className={`btn-asistir ${attending[ev.id] ? 'attending' : ''}`}
                        onClick={() => toggleAttend(ev.id)}
                      >
                        {attending[ev.id] ? 'Asistiendo' : 'Asistir'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="eventos-empty">
                <p>No hay eventos en esta categoría</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
