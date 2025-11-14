import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Bell, Shield, CreditCard, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      currency: 'CLP',
      language: 'es'
    },
    notifications: {
      email: true,
      push: true,
      monthlyReports: true,
      budgetAlerts: true
    },
    privacy: {
      dataSharing: false,
      analytics: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      // TODO: Reemplazar con llamada al backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const mockSettings = {
        profile: {
          name: userData.name || 'Usuario',
          email: userData.email || 'usuario@ejemplo.com',
          currency: 'CLP',
          language: 'es'
        },
        notifications: {
          email: true,
          push: true,
          monthlyReports: true,
          budgetAlerts: true
        },
        privacy: {
          dataSharing: false,
          analytics: true
        }
      };
      
      setSettings(mockSettings);
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSaveSettings = async (section, data) => {
    setSaving(true);
    
    // TODO: Reemplazar con llamada PUT al backend
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Guardar en localStorage temporalmente
    if (section === 'profile') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        name: data.name,
        email: data.email
      }));
    }
    
    setSaving(false);
    alert('Configuración guardada exitosamente');
  };

  const handleExportData = async () => {
    // TODO: Implementar exportación de datos
    console.log('Exportando datos...');
    alert('Función de exportación en desarrollo');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // TODO: Reemplazar con llamada DELETE al backend
      console.log('Eliminando cuenta...');
      alert('Función de eliminación en desarrollo');
    }
  };

  if (loading) {
    return (
      <MainLayout title="Configuración" balance={0}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Cargando configuración...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Configuración" balance={0}>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Gestiona tu cuenta y preferencias</p>
        </div>

        <div className="settings-grid">
          {/* Perfil de Usuario */}
          <Card title="Perfil de Usuario" icon={<User className="card-icon" />}>
            <div className="settings-form">
              <Input
                label="Nombre"
                value={settings.profile.name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value }
                }))}
              />
              
              <Input
                label="Correo Electrónico"
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value }
                }))}
              />
              
              <div className="form-row">
                <div className="form-group">
                  <label>Moneda</label>
                  <select 
                    value={settings.profile.currency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, currency: e.target.value }
                    }))}
                  >
                    <option value="CLP">Peso Chileno (CLP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Idioma</label>
                  <select 
                    value={settings.profile.language}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, language: e.target.value }
                    }))}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              
              <Button 
                variant="primary"
                loading={saving}
                onClick={() => handleSaveSettings('profile', settings.profile)}
              >
                Guardar Cambios
              </Button>
            </div>
          </Card>

          {/* Notificaciones */}
          <Card title="Notificaciones" icon={<Bell className="card-icon" />}>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Notificaciones por Email</span>
                  <span className="setting-description">Recibe resúmenes y alertas por correo</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Notificaciones Push</span>
                  <span className="setting-description">Alertas en tiempo real en la aplicación</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Reportes Mensuales</span>
                  <span className="setting-description">Resumen mensual de tus finanzas</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.monthlyReports}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, monthlyReports: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <Button 
                variant="primary"
                loading={saving}
                onClick={() => handleSaveSettings('notifications', settings.notifications)}
              >
                Guardar Preferencias
              </Button>
            </div>
          </Card>

          {/* Privacidad y Seguridad */}
          <Card title="Privacidad y Seguridad" icon={<Shield className="card-icon" />}>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Compartir Datos Anónimos</span>
                  <span className="setting-description">Ayúdanos a mejorar la aplicación</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.privacy.dataSharing}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataSharing: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <span className="setting-label">Análisis de Datos</span>
                  <span className="setting-description">Habilita análisis inteligente</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.privacy.analytics}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: e.target.checked }
                    }))}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <Button 
                variant="primary"
                loading={saving}
                onClick={() => handleSaveSettings('privacy', settings.privacy)}
              >
                Actualizar Configuración
              </Button>
            </div>
          </Card>

          {/* Gestión de Datos */}
          <Card title="Gestión de Datos" icon={<CreditCard className="card-icon" />}>
            <div className="data-management">
              <div className="data-action">
                <div className="action-info">
                  <h4>Exportar Datos</h4>
                  <p>Descarga todos tus datos en formato CSV</p>
                </div>
                <Button variant="secondary" onClick={handleExportData}>
                  <Download className="icon-sm" />
                  Exportar
                </Button>
              </div>
              
              <div className="data-action dangerous">
                <div className="action-info">
                  <h4>Eliminar Cuenta</h4>
                  <p>Elimina permanentemente tu cuenta y todos tus datos</p>
                </div>
                <Button variant="danger" onClick={handleDeleteAccount}>
                  <Trash2 className="icon-sm" />
                  Eliminar Cuenta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}