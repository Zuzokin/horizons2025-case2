// Импортируем динамическую конфигурацию API
import { API_BASE, getApiConfig, API_ENDPOINTS, getCurrentEnvironment, testApiConnection, fetchWithTimeout } from './config/apiConfig';

// Логируем информацию о конфигурации
console.log('🚀 API Configuration loaded:', {
  baseUrl: API_BASE,
  environment: getCurrentEnvironment(),
  endpoints: API_ENDPOINTS
});

export async function getContrpartnerByName(name: string) {
  const res = await fetch(`${API_BASE}/GetContrpartnerByName?name=${encodeURIComponent(name)}`);
  const data = await res.json();
  // Вернуть массив объектов value, если есть
  return Array.isArray(data) ? data.map(item => item.value) : [];
}

export async function getContrpartnerFirst() {
  const res = await fetch(`${API_BASE}/GetContrpartnerFirst`);
  return await res.json();
}

export async function getTnsByContrpartner(id: number) {
  const res = await fetch(`${API_BASE}/GetTnsByContrpartner?id=${id}`);
  return await res.json();
}

export async function getContrpartnerByInn(inn: string) {
  const res = await fetch(`${API_BASE}/GetContrpartnerByInn?inn=${encodeURIComponent(inn)}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(item => item.value) : [];
}

export async function getTnsByMonths(id: number) {
  const res = await fetch(`${API_BASE}/GetTnsByMonths?id=${id}`);
  return await res.json();
}

export async function getTnsBySuppliers(id: number) {
  const res = await fetch(`${API_BASE}/GetTnsBySuppliers?id=${id}`);
  return await res.json();
}

export async function getAssortments(id: number) {
  const res = await fetch(`${API_BASE}/GetAssortments?id=${id}`);
  return await res.json();
}

export async function getSaleDocumentsByContrpartner(id: number) {
  const res = await fetch(`${API_BASE}/GetSaleDocumentsByContrpartner?id=${id}`);
  return await res.json();
}

export async function getFrequentlyAssortment(id: number) {
  const res = await fetch(`${API_BASE}/GetFrequentlyAssortment?id=${id}`);
  return await res.json();
}

export async function getFrequentlyAssortmentByContrpartner(id: number) {
  const res = await fetch(`${API_BASE}/GetFrequentlyAssortmentByContrpartner?id=${id}`);
  const text = await res.text();
  if (!text) return [];
  return JSON.parse(text);
}

export async function getAprioriAssortment(id: number) {
  const res = await fetch(`${API_BASE}/GetAssortmentApriori?id=${id}`);
  const text = await res.text();
  if (!text) return [];
  return JSON.parse(text);
}

// ===== API для системы мониторинга цен =====

// Получить все данные о ценах на металлопродукцию
export async function getMetalsPricingData(limit: number = 100, offset: number = 0) {
  try {
    console.log(`Fetching data from: ${API_BASE}/csv-data/products-json?limit=${limit}&offset=${offset}`);
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}${API_ENDPOINTS.PRODUCTS.LIST}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }, config.timeout);
    
    console.log('Response status:', res.status);
    console.log('Response headers:', res.headers);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching metals pricing data:', error);
    throw error;
  }
}

// Получить проблемные трубы
export async function getProblematicTubes(filters?: any) {
  try {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/api/problematic-tubes${queryParams ? `?${queryParams}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching problematic tubes:', error);
    throw error;
  }
}

// Получить уведомления об активности конкурентов
export async function getCompetitorNotifications() {
  try {
    const res = await fetch(`${API_BASE}/api/competitor-notifications`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching competitor notifications:', error);
    throw error;
  }
}

// Получить детальную аналитику по трубе
export async function getTubeDetailAnalysis(tubeId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/tube-analysis/${tubeId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching tube analysis:', error);
    throw error;
  }
}

// Получить рекомендации по ценам
export async function getPriceRecommendations(filters?: any) {
  try {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/api/price-recommendations${queryParams ? `?${queryParams}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error fetching price recommendations:', error);
    throw error;
  }
}

// ===== API для системы ценообразования =====

// Получить рекомендацию по цене для одного продукта
export async function getPriceRecommendation(productData: any) {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/pricing/recommend`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
      body: JSON.stringify(productData),
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Price recommendation received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching price recommendation:', error);
    throw error;
  }
}

// Получить рекомендации по ценам для нескольких продуктов
export async function getBulkPriceRecommendations(products: any[]) {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/pricing/recommend/bulk`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
      body: JSON.stringify({ products }),
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Bulk price recommendations received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bulk price recommendations:', error);
    throw error;
  }
}

// Получить рыночные данные
export async function getMarketData() {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/pricing/market-data`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Market data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

// Обновить рыночные данные
export async function updateMarketData(marketData: any) {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/pricing/market-data/update`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
      body: JSON.stringify({ market_history: marketData }),
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Market data updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating market data:', error);
    throw error;
  }
}

// Проверить работоспособность сервиса ценообразования
export async function checkPricingHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/pricing/health`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error checking pricing health:', error);
    throw error;
  }
}

// Применить рекомендацию по цене
export async function applyPriceRecommendation(recommendationId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/apply-recommendation/${recommendationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error applying price recommendation:', error);
    throw error;
  }
}

// Проверить доступность API
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
}

// ===== API для авторизации =====

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
}

// Регистрация пользователя
export async function registerUser(userData: RegisterRequest): Promise<string> {
  try {
    console.log('Registering user:', userData.email);
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(userData),
    }, config.timeout);
    
    console.log('Registration response status:', res.status);
    console.log('Registration response headers:', res.headers);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Registration error:', errorText);
      
      // Более детальная обработка ошибок
      if (res.status === 405) {
        throw new Error('CORS не настроен на сервере. Обратитесь к администратору.');
      } else if (res.status === 500) {
        throw new Error('Ошибка сервера при регистрации. Проверьте логи сервера.');
      } else if (res.status === 422) {
        throw new Error('Неверные данные для регистрации. Проверьте формат email и пароль.');
      } else {
        throw new Error(`Ошибка регистрации: ${res.status} - ${errorText}`);
      }
    }
    
    const result = await res.text();
    console.log('Registration successful');
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Вход в систему
export async function loginUser(credentials: LoginRequest): Promise<TokenResponse> {
  try {
    console.log('Logging in user:', credentials.username);
    
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      mode: 'cors',
      credentials: 'omit',
      body: formData,
    }, config.timeout);
    
    console.log('Login response status:', res.status);
    console.log('Login response headers:', res.headers);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Login error:', errorText);
      
      // Более детальная обработка ошибок
      if (res.status === 401) {
        throw new Error('Неверный email или пароль. Проверьте учетные данные.');
      } else if (res.status === 405) {
        throw new Error('CORS не настроен на сервере. Обратитесь к администратору.');
      } else if (res.status === 422) {
        throw new Error('Неверный формат данных. Проверьте email и пароль.');
      } else {
        throw new Error(`Ошибка входа: ${res.status} - ${errorText}`);
      }
    }
    
    const tokenData = await res.json();
    console.log('Login successful');
    return tokenData;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Получить информацию о текущем пользователе
export async function getCurrentUser(token: string): Promise<UserResponse> {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}${API_ENDPOINTS.AUTH.USER_INFO}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Get user error:', errorText);
      throw new Error(`Failed to get user: ${res.status} - ${errorText}`);
    }
    
    const userData = await res.json();
    console.log('User data retrieved');
    return userData;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

