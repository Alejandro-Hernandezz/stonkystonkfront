import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Download, Filter, Calendar, BarChart3, TrendingUp, PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: 'month',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      // TODO: Reemplazar con llamada al backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockReportData = {
        summary: {
          totalIncome: 450000,
          totalExpenses: 275000,
          netSavings: 175000,
          savingsRate: 38.9,
          incomeGrowth: 5.2,
          expenseGrowth: -2.8
        },
        expensesByCategory: [
          { category: 'Alimentación', amount: 85000, percentage: 30.9, trend: 2.3 },
          { category: 'Transporte', amount: 45000, percentage: 16.4, trend: -1.5 },
          { category: 'Entretenimiento', amount: 35000, percentage: 12.7, trend: 4.1 },
          { category: 'Servicios', amount: 28000, percentage: 10.2, trend: 0.8 },
          { category: 'Otros', amount: 82000, percentage: 29.8, trend: 3.2 }
        ],
        monthlyTrend: [
          { month: 'Ene', income: 450000, expenses: 275000, savings: 175000 },
          { month: 'Feb', income: 420000, expenses: 290000, savings: 130000 },
          { month: 'Mar', income: 480000, expenses: 260000, savings: 220000 }
        ],
        topCategories: [
          { name: 'Alimentación', value: 85000, color: '#10b981' },
          { name: 'Otros', value: 82000, color: '#06b6d4' },
          { name: 'Transporte', value: 45000, color: '#f59e0b' }
        ]
      };
      
      setReportData(mockReportData);
      setLoading(false);
    };

    loadReportData();
  }, [filters]);

  const handleExportReport = (format) => {
    // TODO: Implementar exportación de reportes
    console.log(`Exportando reporte en formato: ${format}`);
  };

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <MainLayout title="Reportes" balance={0}>
        <div className="loading-screen">
          <BarChart3 className="loading-icon" />
          <p>Generando reportes...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reportes y Análisis" balance={0}>
      <div className="reports-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-info">
            <h1 className="page-title">Reportes Financieros</h1>
            <p className="page-subtitle">Análisis detallado de tus finanzas</p>
          </div>
          
          <div className="header-actions">
            <div className="filters">
              <Calendar className="filter-icon" />
              <select 
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            <Button variant="secondary">
              <Filter className="icon-sm" />
              Filtros Avanzados
            </Button>
            
            <Button variant="primary" onClick={() => handleExportReport('pdf')}>
              <Download className="icon-sm" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Resumen Ejecutivo Mejorado */}
        <div className="executive-summary">
          <Card className="summary-card">
            <h3>Resumen Ejecutivo del Periodo</h3>
            <div className="summary-grid">
              <div className="summary-item summary-item-income">
                <div className="summary-header">
                  <span className="label">Ingresos Totales</span>
                  <div className="trend-badge positive">
                    <ArrowUpRight className="trend-icon" />
                    <span>{reportData.summary.incomeGrowth}%</span>
                  </div>
                </div>
                <span className="value income">{formatCurrency(reportData.summary.totalIncome)}</span>
                <span className="sublabel">vs periodo anterior</span>
              </div>
              
              <div className="summary-item summary-item-expense">
                <div className="summary-header">
                  <span className="label">Gastos Totales</span>
                  <div className="trend-badge negative">
                    <ArrowDownLeft className="trend-icon" />
                    <span>{Math.abs(reportData.summary.expenseGrowth)}%</span>
                  </div>
                </div>
                <span className="value expense">{formatCurrency(reportData.summary.totalExpenses)}</span>
                <span className="sublabel">vs periodo anterior</span>
              </div>
              
              <div className="summary-item summary-item-savings">
                <div className="summary-header">
                  <span className="label">Ahorro Neto</span>
                  <TrendingUp className="header-icon" />
                </div>
                <span className="value savings">{formatCurrency(reportData.summary.netSavings)}</span>
                <span className="sublabel">disponible para invertir</span>
              </div>
              
              <div className="summary-item summary-item-rate">
                <div className="summary-header">
                  <span className="label">Tasa de Ahorro</span>
                  <PieChart className="header-icon" />
                </div>
                <span className="value rate">{reportData.summary.savingsRate}%</span>
                <span className="sublabel">del ingreso total</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sección de Gráficos Principal */}
        <div className="reports-grid">
          {/* Distribución de Gastos */}
          <Card title="Distribución de Gastos por Categoría" className="chart-card">
            <div className="categories-list">
              {reportData.expensesByCategory.map((item, index) => (
                <div 
                  key={index} 
                  className="category-item"
                  onMouseEnter={() => setHoveredCategory(index)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="category-info">
                    <div className="category-header">
                      <span className="category-name">{item.category}</span>
                      <div className={`category-trend ${item.trend > 0 ? 'up' : 'down'}`}>
                        {item.trend > 0 ? <ArrowUpRight className="mini-icon" /> : <ArrowDownLeft className="mini-icon" />}
                        <span>{Math.abs(item.trend)}%</span>
                      </div>
                    </div>
                    <span className="category-amount">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${item.percentage}%`,
                          opacity: hoveredCategory === null || hoveredCategory === index ? 1 : 0.3,
                          transition: 'opacity 0.2s ease'
                        }}
                      ></div>
                    </div>
                    <span className="percentage">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-footer">
              <span className="footer-text">Gasto total: {formatCurrency(reportData.summary.totalExpenses)}</span>
            </div>
          </Card>

          {/* Tendencia Mensual Mejorada */}
          <Card title="Tendencia de Ingresos vs Gastos" className="chart-card">
            <div className="trend-chart">
              {reportData.monthlyTrend.map((month, index) => (
                <div key={index} className="trend-item">
                  <span className="month-label">{month.month}</span>
                  <div className="trend-bars">
                    <div 
                      className="trend-bar income"
                      style={{ height: `${(month.income / 500000) * 100}%` }}
                      title={`Ingresos: ${formatCurrency(month.income)}`}
                    ></div>
                    <div 
                      className="trend-bar expense"
                      style={{ height: `${(month.expenses / 500000) * 100}%` }}
                      title={`Gastos: ${formatCurrency(month.expenses)}`}
                    ></div>
                  </div>
                  <div className="month-details">
                    <span className="savings-badge">${(month.savings / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color income"></div>
                <span>Ingresos</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense"></div>
                <span>Gastos</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjetas de Información Adicional */}
        <div className="info-cards-grid">
          <Card className="info-card">
            <div className="info-card-content">
              <div className="info-icon income">
                <ArrowUpRight />
              </div>
              <div className="info-text">
                <span className="info-label">Categoría con Mayor Gasto</span>
                <span className="info-value">{reportData.expensesByCategory[0].category}</span>
                <span className="info-sublabel">{reportData.expensesByCategory[0].percentage}% del total</span>
              </div>
            </div>
          </Card>

          <Card className="info-card">
            <div className="info-card-content">
              <div className="info-icon savings">
                <TrendingUp />
              </div>
              <div className="info-text">
                <span className="info-label">Eficiencia Financiera</span>
                <span className="info-value">{reportData.summary.savingsRate}%</span>
                <span className="info-sublabel">Excelente desempeño</span>
              </div>
            </div>
          </Card>

          <Card className="info-card">
            <div className="info-card-content">
              <div className="info-icon expense">
                <ArrowDownLeft />
              </div>
              <div className="info-text">
                <span className="info-label">Ahorro Acumulado</span>
                <span className="info-value">{formatCurrency(reportData.summary.netSavings)}</span>
                <span className="info-sublabel">En este periodo</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Reportes Rápidos Mejorados */}
        <div className="additional-reports">
          <Card title="Reportes Rápidos">
            <div className="reports-list">
              <Button variant="ghost" full className="report-button">
                <BarChart3 className="report-icon" />
                Estado de Flujo de Caja
              </Button>
              <Button variant="ghost" full className="report-button">
                <TrendingUp className="report-icon" />
                Análisis de Hábitos de Gasto
              </Button>
              <Button variant="ghost" full className="report-button">
                <Filter className="report-icon" />
                Proyección de Ahorros
              </Button>
              <Button variant="ghost" full className="report-button">
                <Calendar className="report-icon" />
                Comparativa Anual
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}