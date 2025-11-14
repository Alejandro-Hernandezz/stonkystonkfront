import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Lock, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [verifyingToken, setVerifyingToken] = useState(true);

  // Verificar que el token sea válido al montar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifyingToken(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        setTokenValid(false);
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Error al restablecer la contraseña' });
        return;
      }

      setSuccessMessage('¡Contraseña restablecida correctamente! Redirigiendo al login...');
      setFormData({ password: '', confirmPassword: '' });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Tu contraseña ha sido restablecida. Inicia sesión con tu nueva contraseña.' }
        });
      }, 3000);

    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setErrors({ general: 'Error de conexión. Por favor, intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica el token
  if (verifyingToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <DollarSign className="auth-logo" size={48} />
            <h1 className="auth-title">StonkyStonk</h1>
            <p className="auth-subtitle">Verificando enlace...</p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Por favor espera...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <DollarSign className="auth-logo" size={48} />
            <h1 className="auth-title">StonkyStonk</h1>
            <p className="auth-subtitle">Recuperar Contraseña</p>
          </div>

          <div className="alert alert-error">
            <AlertCircle size={20} />
            <div>
              <p>El enlace de recuperación es inválido o ha expirado.</p>
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Por favor, solicita un nuevo enlace de recuperación.
              </p>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/forgot-password" className="auth-link">
                Solicitar nuevo enlace
              </Link>
            </p>
            <Link to="/login" className="auth-link">
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <DollarSign className="auth-logo" size={48} />
          <h1 className="auth-title">StonkyStonk</h1>
          <p className="auth-subtitle">Restablecer Contraseña</p>
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
            <p>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={errors.password ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            <small style={{ marginTop: '5px', display: 'block' }}>
              Mínimo 8 caracteres
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
}