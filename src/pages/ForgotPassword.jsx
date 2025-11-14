import { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, Mail, AlertCircle, Info, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Error al procesar la solicitud' });
        return;
      }

      setSubmitted(true);
      setSuccessMessage(
        `Te hemos enviado un enlace de recuperación a ${email}. ` +
        'Por favor, revisa tu bandeja de entrada y sigue las instrucciones.'
      );
      setEmail('');

      // Redirigir al login después de 5 segundos
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      console.error('Error al solicitar reset de contraseña:', error);
      setErrors({ general: 'Error de conexión. Por favor, intenta de nuevo.' });
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
          <p className="auth-subtitle">Recupera tu contraseña</p>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <Info size={20} />
            <p>{successMessage}</p>
          </div>
        )}

        {!submitted && (
          <>
            <div className="auth-description">
              <p>
                Ingresa el email asociado a tu cuenta y te enviaremos un enlace 
                para recuperar tu contraseña.
              </p>
            </div>

            {errors.general && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    disabled={loading}
                    className={errors.email ? 'error' : ''}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link-back">
            <ArrowLeft size={18} />
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
}