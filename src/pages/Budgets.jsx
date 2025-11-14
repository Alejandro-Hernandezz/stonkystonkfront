import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BudgetForm from '../components/budgets/BudgetForm';
import { Plus, PieChart, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

// Función para formatear números a CLP
const formatCLP = (value) => {
  if (!value || isNaN(value)) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    loadBudgets();
    
    // Recargar presupuestos cada 10 segundos para verificar cambios de transacciones
    const interval = setInterval(() => {
      loadBudgets();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Escuchar cambios de visibilidad (cuando vuelves a la pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadBudgets();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/budgets`,
        axiosConfig
      );
      
      console.log('Presupuestos cargados:', response.data); // Para debugging
      setBudgets(response.data.budgets || []);
    } catch (err) {
      console.error('Error al cargar presupuestos:', err);
      setError(err.response?.data?.error || 'Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (editingBudget) {
        await axios.put(
          `${API_BASE_URL}/budgets/${editingBudget.id}`,
          {
            monthlyLimit: budgetData.monthlyLimit,
            alertThreshold: budgetData.alertThreshold || 80,
            description: budgetData.description
          },
          axiosConfig
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/budgets`,
          {
            categoryId: budgetData.categoryId,
            monthlyLimit: budgetData.monthlyLimit,
            alertThreshold: budgetData.alertThreshold || 80,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            description: budgetData.description
          },
          axiosConfig
        );
      }
      
      await loadBudgets();
      setShowForm(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Error al guardar presupuesto:', err);
      throw err.response?.data?.error || 'Error al guardar el presupuesto';
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/budgets/${budgetId}`,
        axiosConfig
      );
      
      await loadBudgets();
    } catch (err) {
      console.error('Error al eliminar presupuesto:', err);
      setError(err.response?.data?.error || 'Error al eliminar el presupuesto');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getBudgetStatus = (budget) => {
    // CORRECCIÓN: Usar spent.currentSpent en lugar de spentAmount
    const spentAmount = budget.spent?.currentSpent || 0;
    const monthlyLimit = budget.monthlyLimit || 1;
    const percentage = (spentAmount / monthlyLimit) * 100;
    
    if (percentage >= 100) return 'over-budget';
    if (percentage >= (budget.alertThreshold || 80)) return 'warning';
    return 'good';
  };

  // CORRECCIÓN: Calcular totales usando spent.currentSpent
  const totalAllocated = budgets.reduce((sum, b) => sum + (parseFloat(b.monthlyLimit) || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (parseFloat(b.spent?.currentSpent) || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <MainLayout title="Presupuestos" balance={0}>
      <div className="budgets-page">
        <div className="page-header">
          <div className="header-info">
            <h1 className="page-title">Gestión de Presupuestos</h1>
            <p className="page-subtitle">Controla tus gastos por categoría</p>
          </div>
          <div className="header-actions">
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`icon-sm ${refreshing ? 'rotating' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="icon-sm" />
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="budgets-summary">
          <Card className="summary-card">
            <h3>Resumen Mensual</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-label">Total Presupuestado</span>
                <span className="stat-value">
                  {formatCLP(totalAllocated)}
                </span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Total Gastado</span>
                <span className="stat-value">
                  {formatCLP(totalSpent)}
                </span>
              </div>
              <div className="summary-stat">
                <span className={`stat-value ${totalRemaining >= 0 ? 'positive' : 'negative'}`}>
                  {formatCLP(Math.abs(totalRemaining))}
                </span>
                <span className="stat-label">
                  {totalRemaining >= 0 ? 'Restante' : 'Sobrepasado'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Tus Presupuestos">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando presupuestos...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="empty-state">
              <PieChart className="empty-icon" size={64} />
              <h3>No hay presupuestos configurados</h3>
              <p>Comienza creando tu primer presupuesto para controlar tus gastos</p>
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <Plus className="icon-sm" />
                Crear Presupuesto
              </Button>
            </div>
          ) : (
            <div className="budgets-list">
              {budgets.map(budget => {
                // CORRECCIÓN: Usar spent.currentSpent en lugar de spentAmount
                const spentAmount = budget.spent?.currentSpent || 0;
                const monthlyLimit = budget.monthlyLimit || 1;
                const status = getBudgetStatus(budget);
                const percentage = (spentAmount / monthlyLimit) * 100;
                
                return (
                  <div key={budget.id} className="budget-item">
                    <div className="budget-header">
                      <div className="budget-category">
                        <span className="category-name">{budget.category?.name || 'Sin categoría'}</span>
                        <span className={`status-indicator ${status}`}>
                          {status === 'over-budget' && <AlertTriangle className="icon-xs" />}
                          {status === 'warning' && <AlertTriangle className="icon-xs" />}
                          {status === 'good' && <CheckCircle className="icon-xs" />}
                          {status === 'over-budget' && 'Excedido'}
                          {status === 'warning' && 'Alerta'}
                          {status === 'good' && 'Bien'}
                        </span>
                      </div>
                      <div className="budget-amounts">
                        <span className="spent">{formatCLP(spentAmount)}</span>
                        <span className="separator">/</span>
                        <span className="allocated">{formatCLP(monthlyLimit)}</span>
                      </div>
                    </div>
                    
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${status}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="progress-percentage">{percentage.toFixed(0)}%</span>
                    </div>

                    {budget.description && (
                      <p className="budget-description">{budget.description}</p>
                    )}
                    
                    <div className="budget-actions">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {showForm && (
          <BudgetForm
            budget={editingBudget}
            onSave={handleSaveBudget}
            onCancel={handleCloseForm}
          />
        )}
      </div>
    </MainLayout>
  );
}