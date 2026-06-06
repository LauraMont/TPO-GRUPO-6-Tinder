import { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../layouts/eventDashboard.css'; // Tu archivo de estilos
import Card from '../components/ui/card/Card';

export default function EventDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Activos', 'Borradores'];

  // Mock de datos (Esto vendrá de tu fetch a FastAPI/MongoDB)
  const featuredEvent = {
    id: 1,
    title: 'Sunset Rooftop Party',
    dateStr: 'Sáb, 24 May • 18:00 hs',
    location: 'Terraza Trade Skybar, CABA',
    status: 'PRÓXIMO'
  };

  const catalogEvents = [
    {
      id: 2,
      day: '28',
      month: 'MAY',
      title: 'Cata de Vinos a Ciegas',
      details: 'Palermo Soho • 20:30 hs',
      theme: 'orange' // Para el gradiente de la fecha
    },
    {
      id: 3,
      day: '02',
      month: 'JUN',
      title: 'Trekking y Mates',
      details: 'Reserva Ecológica • 10:00 hs',
      theme: 'blue' // Para el gradiente de la fecha
    }
  ];

  return (
    <div className="admin-dashboard-container">
      <Card>
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Administrar IRL</h1>
          <div className="subtitle-container">
            <span className="live-dot"></span>
            <p>Panel de Control</p>
          </div>
        </div>
        
        {/* Botón para ir al formulario que creamos antes */}
        <button className="add-event-btn" onClick={() => navigate('/register-evento')}>
          <Plus size={24} color="#ffffff" />
        </button>
      </header>

      {/* Filtros tipo Píldora */}
      <div className="dashboard-filters">
        {filters.map(filter => (
          <button 
            key={filter}
            className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="dashboard-scroll-area">
        
        {/* Tarjeta Destacada */}
        <div className="featured-card">
          <div className="featured-badge">
            <span className="badge-dot"></span> {featuredEvent.status}
          </div>
          
          <div className="featured-content">
            <h2>{featuredEvent.title}</h2>
            <p className="featured-date">{featuredEvent.dateStr}</p>
            <p className="featured-location">
              <MapPin size={14} /> {featuredEvent.location}
            </p>
          </div>

          <button className="edit-overlay-btn" onClick={() => console.log('Editar', featuredEvent.id)}>
            Editar
          </button>
        </div>

        {/* Listado del Catálogo */}
        <div className="catalog-section">
          <h3>Gestionar catálogo</h3>
          
          <div className="catalog-list">
            {catalogEvents.map(ev => (
              <div key={ev.id} className="catalog-item">
                
                {/* Bloque de Fecha */}
                <div className={`date-block theme-${ev.theme}`}>
                  <span className="date-day">{ev.day}</span>
                  <span className="date-month">{ev.month}</span>
                </div>
                
                {/* Info del Evento */}
                <div className="catalog-info">
                  <h4>{ev.title}</h4>
                  <p><MapPin size={12} /> {ev.details}</p>
                </div>
                
                {/* Botón de Acción */}
                <button className="item-edit-btn" onClick={() => console.log('Editar', ev.id)}>
                  Editar
                </button>

              </div>
            ))}
          </div>
        </div>
        
        {/* Espacio para la barra de navegación inferior (BottomNav) */}
        <div className="bottom-nav-spacer"></div>
      </div>
</Card>
    </div>
  );
}