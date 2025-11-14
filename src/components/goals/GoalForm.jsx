import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export default function GoalForm({ onSave, onCancel, goal = null }) {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount || '',
    deadline: goal?.deadline || '',
    categoryId: goal?.categoryId || '',
    description: goal?.description || ''
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Cargar categorías disponibles
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(`${API_BASE_URL}/categories`, axiosConfig);
      
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      // Si falla, usar categorías por defecto
      setCategories([
        { id: 1, name: 'Viajes', icon: 'plane', type: 'goal' },
        { id: 2, name: 'Tecnología', icon: 'laptop', type: 'goal' },
        { id: 3, name: 'Educación', icon: 'book', type: 'goal' },
        { id: 4, name: 'Salud', icon: 'heart', type: 'goal' },
        { id: 5, name: 'Vivienda', icon: 'home', type: 'goal' },
        { id: 6, name: 'Vehículo', icon: 'car', type: 'goal' },
        { id: 7, name: 'Emergencia', icon: 'alert', type: 'goal' },
        { id: 8, name: 'Inversiones', icon: 'chart-line', type: 'goal' },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validaciones
    if (!formData.name || !formData.name.trim()) {
      setError('El nombre de la meta es obligatorio');
      setLoading(false);
      return;
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      setError('El monto debe ser mayor a 0');
      setLoading(false);
      return;
    }

    if (!formData.deadline) {
      setError('La fecha límite es obligatoria');
      setLoading(false);
      return;
    }

    if (formData.description && formData.description.length > 300) {
      setError('La descripción no puede exceder 300 caracteres');
      setLoading(false);
      return;
    }

    try {
      await onSave({
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        deadline: formData.deadline,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        description: formData.description.trim() || null,
      });
    } catch (err) {
      console.error('Error al guardar la meta:', err);
      setError(err.response?.data?.error || 'Error al guardar la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      title={goal ? "Editar Meta" : "Nueva Meta"} 
      onClose={onCancel}
      size="md"
    >
      <form onSubmit={handleSubmit} className="goal-form">
        {/* Error Message */}
        {error && (
          <div className="error-banner" style={{ marginBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        )}

        {/* Nombre */}
        <Input
          label="Nombre de la Meta"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Viaje a Europa"
          disabled={loading}
          maxLength="100"
        />

        {/* Monto */}
        <Input
          label="Monto Objetivo (CLP)"
          type="number"
          value={formData.targetAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
          placeholder="500000"
          min="1"
          disabled={loading}
        />

        {/* Fecha Límite */}
        <Input
          label="Fecha Límite"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          disabled={loading}
          min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
        />

        {/* Categoría */}
        <div className="form-group">
          <label>Categoría (Opcional)</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            disabled={loading || categoriesLoading}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          >
            <option value="">
              {categoriesLoading ? 'Cargando categorías...' : 'Sin categoría'}
            </option>
            {categories
              .filter(cat => cat.type === 'goal' || cat.type === 'expense') // Mostrar solo goals o expense
              .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción (Opcional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe tu meta... (máx. 300 caracteres)"
            rows="3"
            disabled={loading}
            maxLength="300"
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>
            {formData.description.length}/300 caracteres
          </small>
        </div>

        {/* Form Actions */}
        <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || categoriesLoading}
          >
            {loading ? 'Guardando...' : goal ? 'Actualizar Meta' : 'Crear Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}