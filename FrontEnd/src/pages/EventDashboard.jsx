import { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../layouts/eventDashboard.css'; // Tu archivo de estilos
import Card from '../components/ui/card/Card';

export default function EventDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Activos', 'Borradores'];

  // Data completamente estructurada con los campos del formulario
 const featuredEvent = {
    id: '1',
    title: 'Sunset Rooftop Party',
    category: 'Fiestas',
    date: '2026-05-24',
    time: '18:00',
    dateStr: 'Sáb, 24 May • 18:00 hs',
    location: 'Terraza Trade Skybar, CABA',
    // URL pública de Unsplash con parámetros de optimización (?w=800)
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    status: 'PRÓXIMO',
    // --- NUEVOS CAMPOS PARA EL DETALLE Y EL FORMULARIO ---
    description: 'La mejor fiesta en la terraza para conectar con la comunidad. Música en vivo, tragos de autor y dinámicas de networking.',
    expectedAttendance: 145,
    maxCapacity: 200,
    publishState: 'Publicado'
  };

  const catalogEvents = [
    {
      id: '2',
      title: 'Cata de Vinos a Ciegas',
      category: 'Gastron.',
      day: '28',
      month: 'MAY',
      location: 'Palermo Soho, CABA',
      // URL pública de copa de vino
      bannerUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
      theme: 'orange',
      // --- NUEVOS CAMPOS PARA EL DETALLE Y EL FORMULARIO ---
      date: '2026-05-28',
      time: '20:30',
      dateStr: 'Jue, 28 May • 20:30 hs',
      status: 'FINALIZADO',
      description: 'Una experiencia sensorial única. Descubre aromas y sabores seleccionados por sommeliers.',
      expectedAttendance: 48,
      maxCapacity: 50,
      publishState: 'Publicado'
    },
    {
      id: '3',
      title: 'Trekking y Mates',
      category: 'Deportes',
      day: '02',
      month: 'JUN',
      location: 'Reserva Ecológica, CABA',
      // URL pública de naturaleza
      bannerUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&q=80',
      theme: 'blue',
      // --- NUEVOS CAMPOS PARA EL DETALLE Y EL FORMULARIO ---
      date: '2026-06-02',
      time: '10:00',
      dateStr: 'Mar, 02 Jun • 10:00 hs',
      status: 'PRÓXIMO',
      description: 'Caminata al aire libre, naturaleza y una ronda de mates para compartir historias y conectar de forma genuina.',
      expectedAttendance: 18,
      maxCapacity: 30,
      publishState: 'Borrador'
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
        <button className="add-event-btn" onClick={() => navigate('/admin/events/new')}>
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
        <div 
          className="featured-card"
          style={{
            // El degradado lineal oscuro protege el texto, la foto va detrás
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, #0d0e15 100%), url('${featuredEvent.bannerUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={() => {
            navigate(`/admin/events/detail/${featuredEvent.id}`, { state: { eventData: featuredEvent } 
            })}}
        >
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

          <button 
            className="edit-overlay-btn" 
            onClick={(e) => 
              {e.stopPropagation();
              navigate(`/admin/events/edit/${featuredEvent.id}`, { state: { eventData: featuredEvent } })}}
          >
            Editar
          </button>
        </div>

        {/* Listado del Catálogo */}
        <div className="catalog-section">
          <h3>Gestionar catálogo</h3>
          
          <div className="catalog-list">
            {catalogEvents.map(ev => (
              <div key={ev.id} className="catalog-item"
              onClick={() => navigate(`/admin/events/detail/${ev.id}`, { state: { eventData: ev } })}
              >
                
                {/* Bloque de Fecha */}
                <div className={`date-block theme-${ev.theme}`}>
                  <span className="date-day">{ev.day}</span>
                  <span className="date-month">{ev.month}</span>
                </div>
                
                {/* Info del Evento */}
                <div className="catalog-info">
                  <h4>{ev.title}</h4>
                  <p><MapPin size={12} /> {ev.location}</p>
                </div>
                
                {/* Botón de Acción */}
                <button className="item-edit-btn" onClick={(e) =>{ 
                  e.stopPropagation();
                  navigate(`/admin/events/edit/${ev.id}`, { state: { eventData: ev } })
                  }}>
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