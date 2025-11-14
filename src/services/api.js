// src/services/api.js
/**
 * ✅ SERVICIO DE API CENTRALIZADO
 * Soporta desarrollo local y producción en Azure
 * Manejo automático de tokens y errores
 */

// Obtener URL base según el ambiente
const getAPIUrl = () => {
  // Primero: variable de entorno (definida en .env o .env.production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Segundo: detectar por NODE_ENV o PROD
  if (import.meta.env.PROD) {
    // Producción - Azure
    return 'https://stonky-backend.blackdune-587dd75b.westus3.azurecontainerapps.io';
  }

  // Fallback: desarrollo local
  return 'http://localhost:3000';
};

const API_URL = getAPIUrl();

console.log('🔧 API Configuration:', {
  apiUrl: API_URL,
  env: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD
});

/**
 * Obtener headers con token de autenticación
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Función auxiliar para hacer fetch con manejo de errores centralizado
 */
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_URL}/api${endpoint}`;

  try {
    console.log(`📡 ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    // Leer el body una sola vez
    const data = await response.json().catch(() => ({}));

    // Si no es OK, lanzar error
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}`;
      
      // Si es 401, limpiar sesión
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }

      throw new Error(errorMessage);
    }

    console.log(`✅ Success:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error in ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Objeto con todos los métodos de API
 */
const api = {
  // ==================== AUTH ====================
  
  async login(email, password) {
    // ✅ Opción 1: Llamada REAL al backend
    try {
      const response = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Guardar token y usuario
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }

    // ❌ Opción 2: MOCK (para testing sin backend)
    // Descomenta si quieres usar datos simulados:
    /*
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = {
      user: {
        id: 1,
        email: email,
        name: 'Usuario Demo'
      },
      token: 'mock-jwt-token-12345'
    };
    localStorage.setItem('token', mockUser.token);
    localStorage.setItem('user', JSON.stringify(mockUser.user));
    return { data: mockUser };
    */
  },

  async register(email, password, confirmPassword) {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword })
    });
  },

  async logout() {
    try {
      await fetchAPI('/auth/logout', {
        method: 'POST'
      });
    } finally {
      // Limpiar sesión local sin importar si la llamada al servidor funciona
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return fetchAPI('/auth/me', {
      method: 'GET'
    });
  },

  // ==================== DASHBOARD ====================

  async getDashboardOverview() {
    return fetchAPI('/dashboard/overview', { method: 'GET' });
  },

  async getMonthlyTrend(months = 6) {
    return fetchAPI(`/dashboard/monthly-trend?months=${months}`, { method: 'GET' });
  },

  // ==================== TRANSACTIONS ====================

  async getTransactions(page = 1, limit = 10, sort = 'date:desc') {
    return fetchAPI(`/transactions?page=${page}&limit=${limit}&sort=${sort}`, { method: 'GET' });
  },

  async getTransaction(id) {
    return fetchAPI(`/transactions/${id}`, { method: 'GET' });
  },

  async createTransaction(transactionData) {
    return fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  },

  async updateTransaction(id, transactionData) {
    return fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  },

  async deleteTransaction(id) {
    return fetchAPI(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  // ==================== BUDGETS ====================

  async getBudgets() {
    return fetchAPI('/budgets', { method: 'GET' });
  },

  async getBudget(id) {
    return fetchAPI(`/budgets/${id}`, { method: 'GET' });
  },

  async createBudget(budgetData) {
    return fetchAPI('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  },

  async updateBudget(id, budgetData) {
    return fetchAPI(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData)
    });
  },

  async deleteBudget(id) {
    return fetchAPI(`/budgets/${id}`, {
      method: 'DELETE'
    });
  },

  // ==================== GOALS ====================

  async getGoals() {
    return fetchAPI('/goals', { method: 'GET' });
  },

  async getGoal(id) {
    return fetchAPI(`/goals/${id}`, { method: 'GET' });
  },

  async createGoal(goalData) {
    return fetchAPI('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  },

  async updateGoal(id, goalData) {
    return fetchAPI(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    });
  },

  async deleteGoal(id) {
    return fetchAPI(`/goals/${id}`, {
      method: 'DELETE'
    });
  },

  // ==================== UTILITY ====================

  /**
   * Obtener la URL base (útil para debugging)
   */
  getBaseURL() {
    return API_URL;
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Obtener usuario del localStorage
   */
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Limpiar sesión
   */
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default api;