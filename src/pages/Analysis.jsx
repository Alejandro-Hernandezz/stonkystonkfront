import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TrendingUp, AlertTriangle, Lightbulb, Target, ChevronRight, CheckCircle, Clock, Zap } from 'lucide-react';

export default function Analysis() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState(null);

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      // TODO: Reemplazar con llamada al backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights = [
        {
          id: 1,
          type: 'savings_opportunity',
          title: 'Oportunidad de Ahorro',
          message: 'Podrías ahorrar $45,000 mensuales reduciendo gastos en restaurantes',
          amount: 45000,
          category: 'Entretenimiento',
          confidence: 0.85,
          actionable: true,
          priority: 'high',
          timeframe: '1 mes',
          impact: 'Alto',
          recommendation: 'Establece un presupuesto diario para comidas fuera'
        },
        {
          id: 2,
          type: 'spending_alert',
          title: 'Alerta de Gasto',
          message: 'Gastos en transporte superaron el presupuesto en un 25%',
          amount: 12500,
          category: 'Transporte',
          confidence: 0.92,
          actionable: true,
          priority: 'critical',
          timeframe: 'Inmediato',
          impact: 'Medio',
          recommendation: 'Revisa los recibos recientes de transporte'
        },
        {
          id: 3,
          type: 'trend_analysis',
          title: 'Tendencia Positiva',
          message: 'Tu tasa de ahorro ha aumentado un 15% este trimestre',
          amount: 0,
          category: 'General',
          confidence: 0.78,
          actionable: false,
          priority: 'low',
          timeframe: 'Trimestre',
          impact: 'Positivo',
          recommendation: 'Mantén estos buenos hábitos'
        }
      ];
      
      setInsights(mockInsights);
      setLoading(false);
    };

    loadInsights();
  }, []);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'savings_opportunity': return <Lightbulb className="insight-icon" />;
      case 'spending_alert': return <AlertTriangle className="insight-icon" />;
      case 'trend_analysis': return <TrendingUp className="insight-icon" />;
      default: return <Target className="insight-icon" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'savings_opportunity': return 'success';
      case 'spending_alert': return 'warning';
      case 'trend_analysis': return 'info';
      default: return 'default';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical': return { label: 'Crítico', color: 'critical' };
      case 'high': return { label: 'Alto', color: 'high' };
      case 'medium': return { label: 'Medio', color: 'medium' };
      default: return { label: 'Bajo', color: 'low' };
    }
  };

  const formatCurrency = (value) => {
    return `$${value.toLocaleString('es-CL')}`;
  };

  const totalActionable = insights.filter(i => i.actionable).length;
  const potentialSavings = insights.reduce((sum, i) => sum + i.amount, 0);

  return (
    <MainLayout title="Análisis" balance={0}>
      <div className="analysis-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-info">
            <h1 className="page-title">Análisis Inteligente</h1>
            <p className="page-subtitle">Insights y recomendaciones basadas en tus datos</p>
          </div>
        </div>

        {/* Métricas Principales Mejoradas */}
        <div className="analysis-metrics">
          <Card variant="stonky-primary" className="metric-card metric-card-primary">
            <div className="metric-content">
              <div className="metric-icon-container">
                <TrendingUp className="metric-icon" />
              </div>
              <div className="metric-info">
                <span className="metric-label">Insights Activos</span>
                <span className="metric-value">{insights.length}</span>
                <span className="metric-description">Recomendaciones para mejorar</span>
              </div>
              <div className="metric-badge">{totalActionable} accionables</div>
            </div>
          </Card>

          <Card variant="stonky-success" className="metric-card metric-card-success">
            <div className="metric-content">
              <div className="metric-icon-container">
                <Lightbulb className="metric-icon" />
              </div>
              <div className="metric-info">
                <span className="metric-label">Ahorro Potencial</span>
                <span className="metric-value">{formatCurrency(potentialSavings)}</span>
                <span className="metric-description">Oportunidades identificadas</span>
              </div>
              <div className="metric-badge">Este mes</div>
            </div>
          </Card>

          <Card variant="stonky-warning" className="metric-card metric-card-warning">
            <div className="metric-content">
              <div className="metric-icon-container">
                <AlertTriangle className="metric-icon" />
              </div>
              <div className="metric-info">
                <span className="metric-label">Alertas Críticas</span>
                <span className="metric-value">
                  {insights.filter(i => i.priority === 'critical').length}
                </span>
                <span className="metric-description">Que requieren atención</span>
              </div>
              <div className="metric-badge">Urgente</div>
            </div>
          </Card>
        </div>

        {/* Insights y Recomendaciones */}
        <Card title="Insights Destacados" className="insights-section">
          {loading ? (
            <div className="loading-state">
              <Zap className="loading-icon" />
              <p>Analizando tus datos financieros...</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="empty-state">
              <Target className="empty-icon" />
              <h3>No hay insights disponibles</h3>
              <p>Continúa usando la aplicación para generar análisis personalizados</p>
            </div>
          ) : (
            <div className="insights-list">
              {insights.map((insight, index) => {
                const isExpanded = expandedInsight === insight.id;
                const priorityBadge = getPriorityBadge(insight.priority);
                
                return (
                  <div 
                    key={insight.id} 
                    className={`insight-item ${getInsightColor(insight.type)} priority-${insight.priority}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="insight-header">
                      <div className="insight-icon-container">
                        <div className="icon-wrapper">
                          {getInsightIcon(insight.type)}
                        </div>
                      </div>
                      
                      <div className="insight-title">
                        <div className="title-row">
                          <h4>{insight.title}</h4>
                          <div className="priority-badge" data-priority={priorityBadge.color}>
                            {priorityBadge.label}
                          </div>
                        </div>
                        <span className="confidence">
                          Confianza: {(insight.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {insight.amount > 0 && (
                        <div className="insight-amount">
                          <span className="amount-label">Impacto</span>
                          <span className="amount-value">{formatCurrency(insight.amount)}</span>
                        </div>
                      )}

                      <button 
                        className="expand-button"
                        onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                      >
                        <ChevronRight className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="insight-content">
                      <p className="insight-message">{insight.message}</p>
                      
                      <div className="insight-meta">
                        <span className="meta-item">
                          <span className="meta-label">Categoría:</span>
                          {insight.category}
                        </span>
                        <span className="meta-item">
                          <span className="meta-label">Plazo:</span>
                          {insight.timeframe}
                        </span>
                        <span className="meta-item">
                          <span className="meta-label">Impacto:</span>
                          {insight.impact}
                        </span>
                      </div>
                    </div>

                    {/* Contenido Expandido */}
                    {isExpanded && (
                      <div className="insight-expanded">
                        <div className="expanded-section">
                          <h5>Recomendación</h5>
                          <p>{insight.recommendation}</p>
                        </div>
                        
                        <div className="expanded-section">
                          <h5>Análisis Detallado</h5>
                          <div className="analysis-grid">
                            <div className="analysis-item">
                              <span className="analysis-label">Confianza</span>
                              <div className="confidence-bar">
                                <div 
                                  className="confidence-fill"
                                  style={{ width: `${insight.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="analysis-value">{(insight.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="analysis-item">
                              <span className="analysis-label">Impacto Potencial</span>
                              <span className="impact-value">{insight.impact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insight.actionable && (
                      <div className="insight-actions">
                        <Button variant="primary" size="sm">
                          <CheckCircle className="action-icon" />
                          Tomar Acción
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Clock className="action-icon" />
                          Posponer
                        </Button>
                        <Button variant="ghost" size="sm">
                          Descartar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Análisis Predictivo Mejorado */}
        <div className="predictive-analysis">
          <Card title="Proyecciones Futuras" className="predictive-card">
            <div className="predictive-content">
              <div className="prediction-item">
                <div className="prediction-header">
                  <div>
                    <h4>Próximos 3 Meses</h4>
                    <p className="prediction-description">Basado en tus patrones actuales</p>
                  </div>
                  <div className="prediction-icon success">
                    <TrendingUp />
                  </div>
                </div>
                <div className="prediction-value">
                  <span className="value-amount">$525,000</span>
                  <span className="value-label">en ahorros proyectados</span>
                </div>
                <div className="prediction-bar">
                  <div className="prediction-fill success" style={{ width: '65%' }}></div>
                </div>
                <div className="prediction-details">
                  <span className="detail-item">
                    <span className="detail-label">Mes 1:</span>
                    <span className="detail-value">$175k</span>
                  </span>
                  <span className="detail-item">
                    <span className="detail-label">Mes 2:</span>
                    <span className="detail-value">$180k</span>
                  </span>
                  <span className="detail-item">
                    <span className="detail-label">Mes 3:</span>
                    <span className="detail-value">$170k</span>
                  </span>
                </div>
              </div>
              
              <div className="prediction-item">
                <div className="prediction-header">
                  <div>
                    <h4>Meta Anual</h4>
                    <p className="prediction-description">Progreso hacia tu objetivo</p>
                  </div>
                  <div className="prediction-icon info">
                    <Target />
                  </div>
                </div>
                <div className="prediction-value">
                  <span className="value-amount">85%</span>
                  <span className="value-label">de meta completada</span>
                </div>
                <div className="prediction-bar">
                  <div className="prediction-fill info" style={{ width: '85%' }}></div>
                </div>
                <div className="prediction-milestone">
                  <div className="milestone-item">
                    <span className="milestone-status">Completado</span>
                    <span className="milestone-amount">$2.1M de $2.5M</span>
                  </div>
                  <div className="milestone-time">
                    <Clock className="milestone-icon" />
                    <span>4 meses restantes</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recomendaciones Finales */}
          <Card title="Próximos Pasos" className="recommendations-card">
            <div className="recommendations-list">
              <div className="recommendation-item">
                <div className="recommendation-number">1</div>
                <div className="recommendation-content">
                  <h5>Implementa los cambios inmediatos</h5>
                  <p>Comienza con las alertas críticas para evitar sobregiros</p>
                </div>
                <ChevronRight className="recommendation-icon" />
              </div>
              <div className="recommendation-item">
                <div className="recommendation-number">2</div>
                <div className="recommendation-content">
                  <h5>Monitorea tus gastos semanalmente</h5>
                  <p>Revisa el progreso para mantener el enfoque en tus metas</p>
                </div>
                <ChevronRight className="recommendation-icon" />
              </div>
              <div className="recommendation-item">
                <div className="recommendation-number">3</div>
                <div className="recommendation-content">
                  <h5>Aprovecha las oportunidades de ahorro</h5>
                  <p>Pequeños cambios pueden tener un gran impacto acumulativo</p>
                </div>
                <ChevronRight className="recommendation-icon" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}