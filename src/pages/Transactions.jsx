import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import { Plus, Download, Upload, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Base URL - IMPORTANTE: incluir /api
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    categoryId: 'all',
    dateRange: 'month'
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // Obtener token del localStorage
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Construir URL con query parameters
  const buildUrl = (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== 'all') {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  };

  // Cargar transacciones al montar el componente
  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();

      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación');
      }

      // Construir query parameters
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.type !== 'all') {
        queryParams.type = filters.type;
      }

      if (filters.categoryId !== 'all') {
        queryParams.categoryId = filters.categoryId;
      }

      // Agregar rango de fechas según el filtro
      const today = new Date();
      const startDate = new Date(today);
      
      switch (filters.dateRange) {
        case 'week':
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'month':
          startDate.setMonth(today.getMonth());
          startDate.setDate(1);
          break;
        case 'quarter':
          startDate.setMonth(today.getMonth() - (today.getMonth() % 3));
          startDate.setDate(1);
          break;
        case 'year':
          startDate.setMonth(0);
          startDate.setDate(1);
          break;
        case 'all':
          startDate.setFullYear(2000);
          break;
        default:
          break;
      }

      queryParams.startDate = startDate.toISOString().split('T')[0];
      queryParams.endDate = today.toISOString().split('T')[0];

      const url = buildUrl('/transactions', queryParams);
      console.log('📡 Cargando transacciones:', url);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Transacciones cargadas:', data);

      setTransactions(data.transactions || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('❌ Error al cargar transacciones:', error);
      alert('Error al cargar las transacciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const headers = getHeaders();

      if (!headers.Authorization) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/categories`, { headers });

      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }

      const data = await response.json();
      console.log('✅ Categorías cargadas:', data);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      const headers = getHeaders();

      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación');
      }

      if (editingTransaction) {
        // Actualizar en el backend - PUT /transactions/:id
        console.log('📝 Actualizando transacción ID:', editingTransaction.id);
        const response = await fetch(
          `${API_BASE_URL}/transactions/${editingTransaction.id}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify(transactionData)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar la transacción');
        }

        const updatedData = await response.json();
        console.log('✅ Transacción actualizada:', updatedData);

        setTransactions(prev =>
          prev.map(t =>
            t.id === editingTransaction.id
              ? updatedData.transaction || { ...t, ...updatedData }
              : t
          )
        );
      } else {
        // Crear en el backend - POST /transactions
        console.log('✏️ Creando nueva transacción:', transactionData);
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear la transacción');
        }

        const data = await response.json();
        console.log('✅ Transacción creada:', data);

        const newTransaction = data.transaction || {
          id: Date.now(),
          ...transactionData,
          createdAt: new Date().toISOString()
        };

        setTransactions(prev => [newTransaction, ...prev]);
      }

      setShowForm(false);
      setEditingTransaction(null);
      // Recargar para obtener datos actualizados del servidor
      loadTransactions();
    } catch (error) {
      console.error('❌ Error al guardar transacción:', error);
      alert('Error al guardar la transacción: ' + error.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      return;
    }

    try {
      const headers = getHeaders();

      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación');
      }

      // Soft delete - DELETE /transactions/:id
      console.log('🗑️ Eliminando transacción ID:', transactionId);
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la transacción');
      }

      console.log('✅ Transacción eliminada');
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('❌ Error al eliminar transacción:', error);
      alert('Error al eliminar la transacción: ' + error.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleExport = () => {
    try {
      if (transactions.length === 0) {
        alert('No hay transacciones para exportar');
        return;
      }

      // Crear CSV con las transacciones
      const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
      const csvData = transactions.map(t => [
        t.date,
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        t.category?.name || 'Sin categoría',
        t.description || '',
        t.amount
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Exportación completada');
    } catch (error) {
      console.error('❌ Error al exportar:', error);
      alert('Error al exportar las transacciones');
    }
  };

  const handleImport = () => {
    alert('Función de importación en desarrollo. Próximamente podrás importar transacciones desde CSV.');
  };

  // Calcular totales
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  // Función de formateo
  const formatMoney = (amount) => {
    return parseInt(amount || 0).toLocaleString('es-CL');
  };

  return (
    <MainLayout title="Transacciones" balance={balance}>
      <div className="transactions-page">
        {/* Header con Estadísticas */}
        <div className="page-header">
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon income">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Ingresos</span>
                <span className="stat-value income">+${formatMoney(totalIncome)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon expense">
                <TrendingDown size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Gastos</span>
                <span className="stat-value expense">-${formatMoney(totalExpenses)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon balance">
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Balance</span>
                <span className={`stat-value ${balance >= 0 ? 'income' : 'expense'}`}>
                  ${formatMoney(Math.abs(balance))}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <Button variant="secondary" onClick={handleImport}>
              <Upload className="icon-sm" />
              Importar
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="icon-sm" />
              Exportar
            </Button>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="icon-sm" />
              Nueva Transacción
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Categoría</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Período</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="all">Todo el historial</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Lista de Transacciones */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteTransaction}
        />

        {/* Estado Vacío */}
        {!loading && transactions.length === 0 && (
          <Card className="empty-state">
            <div className="empty-state-content">
              <p className="empty-state-text">
                No hay transacciones registradas
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="icon-sm" />
                Agregar Primera Transacción
              </Button>
            </div>
          </Card>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span>Página {pagination.page} de {pagination.totalPages}</span>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Modal de Transacción */}
        {showForm && (
          <Modal onClose={handleCloseForm}>
            <TransactionForm
              transaction={editingTransaction}
              categories={categories}
              onSave={handleSaveTransaction}
              onCancel={handleCloseForm}
            />
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}