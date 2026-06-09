import { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../layouts/eventDashboard.css'; // Tu archivo de estilos
import Card from '../components/ui/card/Card';

export default function EventDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [events, setEvents] = useState([]); // Estado para la base de datos
  const [isLoading, setIsLoading] = useState(true);
  const filters = ['Todos', 'Activos', 'Borradores'];

  // Llama a tu endpoint GET /admin/events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/events');
        if (!response.ok) throw new Error('Error al cargar eventos');
        const data = await response.json();
        
        // ADAPTADOR: Transformamos la data cruda del backend al formato visual de tu UI
        const formattedData = data.map((apiEv, index) => {
          // Extraemos el día y el mes de 'YYYY-MM-DD' de forma segura
          const dateParts = apiEv.event_date ? apiEv.event_date.split('-') : ['2026', '01', '01'];
          const day = dateParts[2];
          const monthNum = dateParts[1];
          const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
          const monthStr = monthNames[parseInt(monthNum, 10) - 1];

          return {
            id: apiEv.id,
            title: apiEv.title,
            category: apiEv.category,
            date: apiEv.event_date,
            time: apiEv.event_time,
            dateStr: `${day} ${monthStr} • ${apiEv.event_time} hs`,
            day: day,
            month: monthStr,
            location: apiEv.location,
            bannerUrl: apiEv.banner_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', // Fallback si no hay imagen
            description: apiEv.description,
            expectedAttendance: apiEv.expected_attendance,
            maxCapacity: apiEv.max_capacity,
            publishState: apiEv.publish_state,
            status: apiEv.publish_state === 'Publicado' ? 'PRÓXIMO' : 'BORRADOR',
            theme: index % 2 === 0 ? 'orange' : 'blue' // Alterna colores en la lista
          };
        });

        setEvents(formattedData);
      } catch (error) {
        console.error("Fallo la conexión:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Separamos el destacado del catálogo usando la data ya formateada
  const featuredEvent = events.length > 0 ? events[0] : null;
  const catalogEvents = events.length > 1 ? events.slice(1) : [];

  if (isLoading) return <div style={{color: 'white', padding: '20px'}}>Cargando eventos...</div>;

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
          
          {/* VALIDACIÓN: Solo mostramos la tarjeta destacada si hay al menos un evento */}
          {featuredEvent ? (
            <div 
              className="featured-card"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, #0d0e15 100%), url('${featuredEvent.bannerUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/admin/events/detail/${featuredEvent.id}`, { state: { eventData: featuredEvent } })}
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/events/edit/${featuredEvent.id}`, { state: { eventData: featuredEvent } });
                }}
              >
                Editar
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#a0a5b5' }}>
              No hay eventos creados. ¡Añade el primero!
            </div>
          )}

          {/* Listado del Catálogo */}
          {catalogEvents.length > 0 && (
            <div className="catalog-section">
              <h3>Gestionar catálogo</h3>
              
              <div className="catalog-list">
                {catalogEvents.map(ev => (
                  <div 
                    key={ev.id} 
                    className="catalog-item"
                    style={{ cursor: 'pointer' }}
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
                    <button 
                      className="item-edit-btn" 
                      onClick={(e) => { 
                        e.stopPropagation();
                        navigate(`/admin/events/edit/${ev.id}`, { state: { eventData: ev } });
                      }}
                    >
                      Editar
                    </button>

                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Espacio para la barra de navegación inferior (BottomNav) */}
          <div className="bottom-nav-spacer"></div>
        </div>
      </Card>
    </div>
  );
}