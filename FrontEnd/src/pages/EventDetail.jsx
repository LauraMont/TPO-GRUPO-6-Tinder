import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, Radio, EyeOff, Copy, Trash2 } from 'lucide-react';
import '../layouts/eventDetail.css'; 
import Card from '../components/ui/card/Card';

export default function EventDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Respaldo por si se recarga la página (idealmente harías un fetch con un useParams)
  const eventData = location.state?.eventData || {
    id: '1',
    title: 'Sunset Rooftop Party',
    dateStr: 'Sáb, 24 May • 18:00 hs',
    location: 'Terraza Trade Skybar, CABA',
    status: 'PRÓXIMO',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    expectedAttendance: 145,
    maxCapacity: 200,
    publishState: 'Publicado'
  };

  const handleEdit = () => {
    navigate(`/admin/events/edit/${eventData.id}`, { state: { eventData } });
  };

  return (
    <div className="admin-screen-container">
      <Card>
        {/* Header Estándar */}
        <header className="admin-header">
            <button className="back-btn" aria-label="Volver" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} color="#ffffff" />
            </button>
            <h1>Detalle del Evento</h1>
        </header>

        {/* Cuerpo scrolleable de la página */}
        <div className="admin-detail-body">
            
            {/* Banner Fotográfico Reciclado */}
            <div 
            className="detail-banner-card"
            style={{
                // Si no hay foto, mostramos un gradiente morado como en el mockup
                backgroundImage: eventData.bannerUrl 
                ? `linear-gradient(180deg, rgba(0,0,0,0) 50%, #0d0e15 100%), url('${eventData.bannerUrl}')`
                : 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
            >
            <div className="status-badge">
                <span className="dot yellow"></span> {eventData.status}
            </div>
            </div>
            {/* Encabezado del Evento */}
            <div className="detail-header-info">
              <h2>{eventData.title}</h2>
              <p className="highlight-date">{eventData.dateStr}</p>
              <p className="location-text">
                <MapPin size={14} color="#ef4444" className="pin-icon" /> {eventData.location}
              </p>
              
              {/* Nueva sección de descripción */}
              <p className="event-description-text">
                {eventData.description}
              </p>
            </div>

            {/* Componente Card: Cuadrícula de Métricas */}
            <div className="metrics-grid">
            <div className="metric-card">
                <span className="metric-label">Asistencia Esperada</span>
                <div className="metric-value">
                <strong>{eventData.expectedAttendance}</strong> <span>/ {eventData.maxCapacity}</span>
                </div>
            </div>
            
            <div className="metric-card">
                <span className="metric-label">Estado</span>
                <div className="metric-status cyan">{eventData.publishState}</div>
            </div>
            </div>

            {/* Sección: Acciones Rápidas (Iconos directos) */}
            <div className="quick-actions-section">
            <h3>Acciones Rápidas</h3>
            <div className="actions-row">
                
                <div className="action-item" onClick={() => console.log('Anunciar')}>
                <button className="action-circle"><Radio size={22} /></button>
                <span>Anuncio</span>
                </div>
                
                <div className="action-item" onClick={() => console.log('Ocultar')}>
                <button className="action-circle"><EyeOff size={22} /></button>
                <span>Ocultar</span>
                </div>
                
                <div className="action-item" onClick={() => console.log('Duplicar')}>
                <button className="action-circle"><Copy size={22} /></button>
                <span>Duplicar</span>
                </div>
                
                <div className="action-item" onClick={() => console.log('Eliminar')}>
                <button className="action-circle danger"><Trash2 size={22} /></button>
                <span className="danger-text">Eliminar</span>
                </div>

            </div>
            </div>

            {/* Botón Principal (Bloque inferior) */}
            <button className="primary-solid-btn mt-auto" onClick={handleEdit}>
            Editar Detalles del Evento
            </button>

        </div>

      </Card>
    </div>
  );
}