import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, XCircle, Loader } from 'lucide-react';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.message || 'Error al verificar el email');
          return;
        }

        // Verificación exitosa
        setStatus('success');
        setMessage(data.message || '¡Email verificado exitosamente!');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Email verificado. Ya puedes iniciar sesión.'
            }
          });
        }, 3000);

      } catch (error) {
        console.error('Error de verificación:', error);
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta de nuevo.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">StonkyStonk</h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <Loader className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Verificando...
              </h2>
              <p className="text-gray-300">
                {message}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                ¡Verificación Exitosa!
              </h2>
              <p className="text-gray-300">
                {message}
              </p>
              <p className="text-sm text-gray-400">
                Serás redirigido al login en unos segundos...
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="primary" full>
                    Ir al Login Ahora
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Error de Verificación
              </h2>
              <p className="text-gray-300">
                {message}
              </p>
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-200">
                  Posibles causas:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-300 mt-2 space-y-1">
                  <li>El enlace ha expirado (24 horas)</li>
                  <li>El token ya fue utilizado</li>
                  <li>El email ya está verificado</li>
                </ul>
              </div>
              <div className="pt-4 space-y-3">
                <Link to="/login">
                  <Button variant="primary" full>
                    Ir al Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" full>
                    Registrarse de Nuevo
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}