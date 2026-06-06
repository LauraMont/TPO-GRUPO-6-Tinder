import { useState } from 'react';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';
import '../layouts/eventCreate.css';
import Card from '../components/ui/card/Card';

export default function EventCreate() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Fiestas',
    date: '',
    time: '',
    location: '',
    bannerUrl: '',
    description: ''
  });

  const categories = ['Fiestas', 'Talleres', 'Deportes', 'Gastron.'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del nuevo evento listos para el backend:", formData);
    // Aquí conectarías con tu API (ej. axios.post('/api/events', formData))
  };

  return (
    <div className="admin-screen-container">
      <Card>
      {/* Header Reutilizable */}
      <header className="admin-header">
        <button className="back-btn" aria-label="Volver">
          <ChevronLeft size={24} color="#ffffff" />
        </button>
        <h1>Nuevo Evento</h1>
      </header>

      <form className="admin-form-body" onSubmit={handleSubmit}>
        
        {/* Input Reutilizable */}
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

        {/* Píldoras de Categoría Reutilizables */}
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

        {/* Fila Dividida Reutilizable */}
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

        {/* Espaciador para que el scroll no quede tapado por el botón fijo */}
        <div className="bottom-spacer"></div>

      </form>

      {/* Botón Principal Fijo */}
      <div className="fixed-bottom-action">
        <button type="submit" className="primary-gradient-btn" onClick={handleSubmit}>
          Guardar y Publicar
        </button>
      </div>
        </Card>
    </div>
  );
}