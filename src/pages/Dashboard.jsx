import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Target, TrendingUp, CreditCard } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [goals, setGoals] = useState([]);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const apiFetch = async (endpoint) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const calculateMonthComparison = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const loadRealData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión primero.');
      }

      console.log('🚀 Iniciando carga de datos del dashboard...');

      // Cargar todos los datos en paralelo
      const [dashboardResult, transactionsResult, monthlyTrendResult, goalsResult] = await Promise.all([
        apiFetch('/dashboard/overview'),
        apiFetch('/transactions?page=1&limit=5&sort=date:desc'),
        apiFetch('/dashboard/monthly-trend?months=6'),
        apiFetch('/goals')
      ]);

      setDashboardData(dashboardResult.overview);
      setTransactions(transactionsResult.transactions || []);
      setMonthlyTrend(monthlyTrendResult.trend || []);
      
      // Filtrar y contar metas activas
      const activeGoals = (goalsResult.goals || []).filter(g => g.status === 'active');
      setGoals(activeGoals);

      // Calcular progreso promedio de metas activas
      const avgProgress = activeGoals.length > 0
        ? (activeGoals.reduce((acc, g) => acc + (g.progress?.percentage || 0), 0) / activeGoals.length).toFixed(0)
        : 0;

      setPreviousMonthData({
        avgProgress
      });

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      
      let errorMessage = 'Error al cargar los datos del dashboard';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = `No se puede conectar con el servidor backend. Por favor verifica que esté ejecutándose en ${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`;
      } else if (err.message.includes('HTTP error')) {
        errorMessage = `Error del servidor: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  const calculateBalances = () => {
    if (dashboardData) {
      return {
        balance: dashboardData.balance?.currentBalance || 0,
        income: dashboardData.currentMonth?.income || 0,
        expenses: dashboardData.currentMonth?.expense || 0,
        previousIncome: dashboardData.balance?.totalIncome || 0,
        previousExpense: dashboardData.balance?.totalExpense || 0
      };
    } else {
      const balance = transactions.reduce((acc, t) => 
        t.type === 'income' ? acc + t.amount : acc - t.amount, 0
      );

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      return { balance, income, expenses, previousIncome: 0, previousExpense: 0 };
    }
  };

  const { balance, income, expenses, previousIncome, previousExpense } = calculateBalances();

  // Calcular cambios porcentuales
  const incomeChange = calculateMonthComparison(income, previousIncome);
  const expenseChange = calculateMonthComparison(expenses, previousExpense);
  const balanceChange = calculateMonthComparison(balance, previousIncome - previousExpense);

  if (loading) {
    return (
      <MainLayout title="Panel Principal" balance={0}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando tu dashboard financiero...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Panel Principal" balance={0}>
        <div className="card bg-red-900 bg-opacity-20 border-red-700 p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-red-400 mb-4">❌ Error de Conexión</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={loadRealData} 
            className="btn btn-primary"
          >
            🔄 Reintentar
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Panel Principal" balance={balance}>
      <div className="space-y-6">
        {/* Header de Bienvenida */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-400">Aquí está tu resumen financiero</p>
          </div>
          <div className="text-gray-400 text-sm md:text-base">
            {new Date().toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Grid de Métricas Principales - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Saldo Total */}
          <div className="card card-gradient hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="stat-label">Saldo Total</p>
                <p className="text-3xl md:text-2xl font-bold text-white mt-2">
                  ${balance.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="stat-icon income">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className={`stat-change text-sm ${parseFloat(balanceChange) >= 0 ? 'positive' : 'negative'}`}>
              <span>{parseFloat(balanceChange) >= 0 ? '↑' : '↓'}</span> {parseFloat(balanceChange) >= 0 ? '+' : ''}{balanceChange}% vs mes anterior
            </p>
          </div>

          {/* Ingresos */}
          <div className="card card-success hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="stat-label">Ingresos</p>
                <p className="text-3xl md:text-2xl font-bold text-white mt-2">
                  ${income.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="stat-icon income">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className={`stat-change text-sm ${parseFloat(incomeChange) >= 0 ? 'positive' : 'negative'}`}>
              <span>{parseFloat(incomeChange) >= 0 ? '↑' : '↓'}</span> {parseFloat(incomeChange) >= 0 ? '+' : ''}{incomeChange}% vs mes anterior
            </p>
          </div>

          {/* Gastos */}
          <div className="card bg-gradient-to-br from-red-900 to-red-800 border-red-700 hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="stat-label">Gastos</p>
                <p className="text-3xl md:text-2xl font-bold text-white mt-2">
                  ${expenses.toLocaleString('es-CL')}
                </p>
              </div>
              <div className="stat-icon expense">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className={`stat-change text-sm ${parseFloat(expenseChange) <= 0 ? 'positive' : 'negative'}`}>
              <span>{parseFloat(expenseChange) <= 0 ? '↓' : '↑'}</span> {parseFloat(expenseChange) >= 0 ? '+' : ''}{expenseChange}% vs mes anterior
            </p>
          </div>

          {/* Metas Activas */}
          <div className="card bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="stat-label">Metas Activas</p>
                <p className="text-3xl md:text-2xl font-bold text-white mt-2">{goals.length}</p>
              </div>
              <div className="stat-icon goal">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <p className="stat-change text-blue-300 text-sm">
              {previousMonthData?.avgProgress || 0}% completado promedio
            </p>
          </div>
        </div>

        {/* Sección de Contenido - Gráfico y Transacciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Resumen Mensual - Ocupa 2 columnas en desktop */}
          <div className="lg:col-span-2">
            <Card title="Resumen Mensual" className="h-full">
              {monthlyTrend && monthlyTrend.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Gráfico de barras */}
                    <div className="flex-1 flex items-end justify-around gap-2 h-64">
                      {monthlyTrend.map((month, index) => {
                        const maxValue = Math.max(
                          ...monthlyTrend.map(m => Math.max(m.income || 0, m.expense || 0))
                        );
                        
                        const incomeHeight = maxValue > 0 ? ((month.income || 0) / maxValue) * 100 : 5;
                        const expenseHeight = maxValue > 0 ? ((month.expense || 0) / maxValue) * 100 : 5;

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div className="flex gap-1 h-full items-end w-full justify-center">
                              <div 
                                className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm flex-1 max-w-2"
                                style={{ height: `${incomeHeight}%` }}
                              />
                              <div 
                                className="bg-gradient-to-t from-red-500 to-red-400 rounded-t-sm flex-1 max-w-2"
                                style={{ height: `${expenseHeight}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                              {new Date(month.month).toLocaleDateString('es-CL', { month: 'short' })}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-row sm:flex-col gap-4 sm:gap-6 justify-center sm:justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-400 rounded"></div>
                        <span className="text-sm text-gray-300">Ingresos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-red-400 rounded"></div>
                        <span className="text-sm text-gray-300">Gastos</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No hay datos de tendencia mensual disponibles</p>
                </div>
              )}
            </Card>
          </div>

          {/* Transacciones Recientes */}
          <div>
            <Card title="Transacciones Recientes" className="h-full">
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-500 bg-opacity-20' 
                            : 'bg-red-500 bg-opacity-20'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {transaction.description || transaction.category}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold whitespace-nowrap ml-2 ${
                        transaction.type === 'income' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No hay transacciones disponibles</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Sección de Análisis - Solo en desktop si tenemos datos */}
        {monthlyTrend && monthlyTrend.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="card">
              <p className="stat-label mb-2">Promedio Ingresos</p>
              <p className="text-2xl font-bold text-green-400">
                ${(
                  monthlyTrend.reduce((acc, m) => acc + (m.income || 0), 0) / monthlyTrend.length
                ).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="card">
              <p className="stat-label mb-2">Promedio Gastos</p>
              <p className="text-2xl font-bold text-red-400">
                ${(
                  monthlyTrend.reduce((acc, m) => acc + (m.expense || 0), 0) / monthlyTrend.length
                ).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="card">
              <p className="stat-label mb-2">Total Período</p>
              <p className="text-2xl font-bold text-blue-400">
                ${(
                  monthlyTrend.reduce((acc, m) => acc + ((m.income || 0) - (m.expense || 0)), 0)
                ).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="card">
              <p className="stat-label mb-2">Tasa Ahorro</p>
              <p className="text-2xl font-bold text-yellow-400">
                {(
                  (monthlyTrend.reduce((acc, m) => acc + ((m.income || 0) - (m.expense || 0)), 0) / 
                  monthlyTrend.reduce((acc, m) => acc + (m.income || 0), 0)) * 100
                ).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}