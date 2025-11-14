import { useState, useEffect } from 'react';
import { X, Lightbulb, AlertCircle } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export default function TransactionForm({ transaction, categories = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [suggestingCategory, setSuggestingCategory] = useState(false);

  // Si estamos editando, cargar los datos
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        categoryId: transaction.categoryId?.toString() || '',
        date: transaction.date
      });
    }
  }, [transaction]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { categoryId: '' } : {})
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      categoryId: ''
    }));
  };

  const handleGetCategorySuggestion = async () => {
    if (!formData.description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Escribe una descripción primero' }));
      return;
    }

    setSuggestingCategory(true);
    try {
      const headers = getHeaders();

      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación');
      }

      const encodedDescription = encodeURIComponent(formData.description);
      const url = `${API_BASE_URL}/suggestions/best?description=${encodedDescription}&type=${formData.type}`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener sugerencia');
      }

      const data = await response.json();

      if (data.suggestion && data.suggestion.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: data.suggestion.categoryId.toString()
        }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          categoryId: 'No se pudo obtener sugerencia automática' 
        }));
      }
    } catch (error) {
      console.error('Error al obtener sugerencia:', error);
      setErrors(prev => ({ 
        ...prev, 
        categoryId: 'Error: ' + error.message 
      }));
    } finally {
      setSuggestingCategory(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      categoryId: parseInt(formData.categoryId),
      date: formData.date
    };

    await onSave(transactionData);
  };

  // Filtrar categorías por tipo
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="transaction-form-container">
      {/* Header */}
      <div className="transaction-form-header">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="transaction-form-body">
        
        {/* Tipo de Transacción */}
        <div className="form-group">
          <label className="form-label">Tipo de Transacción</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white border-2 border-red-400'
                  : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500'
              }`}
            >
              💸 Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white border-2 border-green-400'
                  : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500'
              }`}
            >
              💰 Ingreso
            </button>
          </div>
          <p className={`text-xs mt-2 flex items-center gap-1 ${
            formData.type === 'expense' ? 'text-red-400' : 'text-green-400'
          }`}>
            {formData.type === 'expense' ? '↓ Registrando un gasto' : '↑ Registrando un ingreso'}
          </p>
        </div>

        {/* Monto */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
              $
            </span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full bg-slate-700 border-2 text-white placeholder-slate-500 rounded-lg py-3 pl-8 pr-4 focus:outline-none transition-all ${
                errors.amount
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-slate-600 focus:border-green-400'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Descripción</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={formData.type === 'expense' ? 'Ej: Compra en supermercado' : 'Ej: Pago de salario'}
            className={`w-full bg-slate-700 border-2 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:outline-none transition-all ${
              errors.description
                ? 'border-red-500 focus:border-red-400'
                : 'border-slate-600 focus:border-green-400'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Categoría */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="categoryId" className="form-label">Categoría</label>
            <button
              type="button"
              onClick={handleGetCategorySuggestion}
              disabled={suggestingCategory || !formData.description.trim()}
              className={`text-xs font-semibold py-1 px-2 rounded flex items-center gap-1 transition-all ${
                suggestingCategory || !formData.description.trim()
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 text-green-400 hover:bg-slate-600'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {suggestingCategory ? 'Sugiriendo...' : 'Sugerir'}
            </button>
          </div>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full bg-slate-700 border-2 text-white rounded-lg py-3 px-4 focus:outline-none transition-all appearance-none cursor-pointer ${
              errors.categoryId
                ? 'border-red-500 focus:border-red-400'
                : 'border-slate-600 focus:border-green-400'
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '16px 16px',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Selecciona una categoría</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">Fecha</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full bg-slate-700 border-2 text-white rounded-lg py-3 px-4 focus:outline-none transition-all ${
              errors.date
                ? 'border-red-500 focus:border-red-400'
                : 'border-slate-600 focus:border-green-400'
            }`}
          />
          {errors.date && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 font-semibold py-3 rounded-lg transition-all ${
              loading
                ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                : formData.type === 'expense'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? 'Guardando...' : (transaction ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  );
}