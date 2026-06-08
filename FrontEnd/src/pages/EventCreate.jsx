import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../layouts/eventCreate.css'; // Tu archivo de estilos para el formulario
import Card from '../components/ui/card/Card';

export default function EventCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Captura el :id de la URL si existe
  
  const isEditing = !!id;

  // 1. Inicialización "Lazy" del estado: Lee la info síncrona directamente si existe
  const [formData, setFormData] = useState(() => {
    const ev = location.state?.eventData;
    
    // Si estamos editando y venimos del Dashboard, cargamos los datos de una
    if (isEditing && ev) {
      return {
        title: ev.title || '',
        category: ev.category || 'Fiestas',
        date: ev.date || '',
        time: ev.time || '',
        location: ev.location || '',
        bannerUrl: ev.bannerUrl || '',
        description: ev.description || ''
      };
    }
    
    // Si es un evento nuevo (o no hay datos previos), arranca vacío
    return {
      title: '',
      category: 'Fiestas',
      date: '',
      time: '',
      location: '',
      bannerUrl: '',
      description: ''
    };
  });

  const categories = ['Fiestas', 'Talleres', 'Deportes', 'Gastron.'];

  // 2. El useEffect es exclusivo para operaciones asíncronas externas (ej. recargar la página)
  useEffect(() => {
    if (isEditing && !location.state?.eventData) {
      console.log(`Buscando en el backend los datos para el evento ID: ${id}`);
      
      /* Ejemplo de tu futuro fetch a FastAPI:
      fetch(`/api/events/${id}`)
        .then(res => res.json())
        .then(data => setFormData({
            title: data.title,
            category: data.category,
            date: data.date,
            time: data.time,
            location: data.location,
            bannerUrl: data.bannerUrl,
            description: data.description
        }))
        .catch(err => console.error("Error cargando evento", err));
      */
    }
  }, [id, isEditing, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      console.log(`Enviando actualización al backend para el evento ${id}:`, formData);
      // axios.put(`/api/events/${id}`, formData)
    } else {
      console.log("Creando un nuevo evento en el backend:", formData);
      // axios.post('/api/events', formData)
    }
    
    // Al terminar, volvemos al dashboard
    navigate('/admin/events'); 
  };

  return (
    <div className="admin-screen-container">
    <Card>
        <header className="admin-header">
          <button type="button" className="back-btn" aria-label="Volver" onClick={() => navigate('/admin/events')}>
            <ChevronLeft size={24} color="#ffffff" />
          </button>
          {/* Cambiamos el título dinámicamente */}
          <h1>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h1>
        </header>

        <form className="admin-form-body" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>Título del evento</label>
            <input 
              type="text" 
              name="title" 
              placeholder="Ej: Tarde de Juegos de Mesa" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Categoría principal</label>
            <div className="pills-container">
              {categories.map(cat => (
                <button 
                  key={cat}
                  type="button"
                  className={`category-pill ${formData.category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Fecha</label>
              <div className="input-with-icon">
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
                <Calendar size={18} className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label>Hora</label>
              <div className="input-with-icon">
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  required 
                />
                <Clock size={18} className="input-icon" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Ubicación</label>
            <input 
              type="text" 
              name="location" 
              placeholder="Ubicación física o enlace virtual" 
              value={formData.location} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Imagen de Portada (URL)</label>
            <input 
              type="url" 
              name="bannerUrl" 
              placeholder="https://unsplash.com/foto..." 
              value={formData.bannerUrl} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Descripción</label>
            <textarea 
              name="description" 
              rows="4" 
              placeholder="Escribe los detalles del evento, reglas, cupos disponibles..." 
              value={formData.description} 
              onChange={handleChange} 
              required 
            />
          </div>

        </form>

        {/* Botón Principal Fijo */}
        <div className="fixed-bottom-action">
          <button type="submit" className="primary-gradient-btn" onClick={handleSubmit}>
            {isEditing ? 'Actualizar Evento' : 'Guardar y Publicar'}
          </button>
        </div>

    </Card>
    </div>
  );
}