import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { DollarSign, Mail, Lock, AlertCircle, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setErrors({ email: 'Ingresa tu email para reenviar la verificación' });
      return;
    }

    setResendingEmail(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Error al reenviar email' });
        return;
      }

      setSuccessMessage('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      setShowResendVerification(false);

    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setShowResendVerification(false);
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message && (
          data.message.includes('verificar') || 
          data.message.includes('verify') ||
          data.message.includes('verificado')
        )) {
          setShowResendVerification(true);
          setErrors({ 
            general: 'Tu email no ha sido verificado. Revisa tu correo o solicita un nuevo enlace de verificación.' 
          });
          return;
        }

        if (data.errors) {
          const serverErrors = {};
          data.errors.forEach(error => {
            serverErrors[error.path] = error.msg;
          });
          setErrors(serverErrors);
        } else {
          setErrors({ general: data.message || 'Credenciales incorrectas' });
        }
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/dashboard');

    } catch (error) {
      console.error('Error de login:', error);
      setErrors({ 
        general: 'Error de conexión con el servidor. Por favor, intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <DollarSign className="auth-logo" size={48} />
          <h1 className="auth-title">StonkyStonk</h1>
          <p className="auth-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <Info size={20} />
            <p>{successMessage}</p>
          </div>
        )}

        {errors.general && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <div>
              <p>{errors.general}</p>
              {showResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="btn-link"
                >
                  {resendingEmail ? 'Reenviando...' : 'Reenviar Email de Verificación'}
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={loading}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}