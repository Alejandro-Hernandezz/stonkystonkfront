import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export default function BudgetForm({ onSave, onCancel, budget = null }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: budget?.categoryId || '',
    monthlyLimit: budget?.monthlyLimit || '',
    alertThreshold: budget?.alertThreshold || 80,
    description: budget?.description || ''
  });

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/categories`,
        axiosConfig
      );
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoría es requerida';
    }

    if (!formData.monthlyLimit || formData.monthlyLimit <= 0) {
      newErrors.monthlyLimit = 'El monto debe ser mayor a 0';
    }

    if (formData.alertThreshold < 1 || formData.alertThreshold > 100) {
      newErrors.alertThreshold = 'El umbral debe estar entre 1 y 100';
    }

    if (formData.description && formData.description.length > 300) {
      newErrors.description = 'La descripción no puede exceder 300 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSave({
        categoryId: Number(formData.categoryId),
        monthlyLimit: Number(formData.monthlyLimit),
        alertThreshold: Number(formData.alertThreshold),
        description: formData.description
      });
    } catch (error) {
      console.error('Error al guardar el presupuesto:', error);
      setErrors({ general: error || 'Error al guardar el presupuesto' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal 
      title={budget ? "Editar Presupuesto" : "Nuevo Presupuesto"} 
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="budget-form">
        {errors.general && (
          <div className="alert alert-error">
            <p>{errors.general}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="categoryId">Categoría</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={errors.categoryId ? 'error' : ''}
            disabled={loading || categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
            </option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
        </div>

        <Input
          label="Monto Mensual"
          type="number"
          name="monthlyLimit"
          value={formData.monthlyLimit}
          onChange={handleChange}
          placeholder="Ej: 150000"
          error={errors.monthlyLimit}
          disabled={loading}
          min="1"
        />

        <Input
          label="Umbral de Alerta (%)"
          type="number"
          name="alertThreshold"
          value={formData.alertThreshold}
          onChange={handleChange}
          placeholder="80"
          error={errors.alertThreshold}
          disabled={loading}
          min="1"
          max="100"
          step="1"
        />

        <div className="form-group">
          <label htmlFor="description">Descripción (Opcional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Agregar descripción..."
            disabled={loading}
            rows="3"
            maxLength="300"
          />
          <span className="char-count">
            {formData.description.length}/300
          </span>
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {budget ? 'Actualizar' : 'Crear'} Presupuesto
          </Button>
        </div>
      </form>
    </Modal>
  );
}