// Конфигурация API для разных окружений
// Автоматическое определение адреса API

interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
  }
  
  // Функция для автоматического определения базового URL API
  function getApiBaseUrl(): string {
    // Проверяем переменную окружения (приоритет)
    const envApiUrl = process.env.REACT_APP_API_BASE_URL;
    if (envApiUrl) {
      console.log('🔧 Using API URL from environment:', envApiUrl);
      return envApiUrl;
    }
    
    // Проверяем сохраненный backend URL
    const savedBackendUrl = localStorage.getItem('backend_url');
    if (savedBackendUrl) {
      console.log('🔧 Using saved backend URL:', savedBackendUrl);
      return savedBackendUrl;
    }
    
    // Проверяем старые настройки сервера (для обратной совместимости)
    const savedIp = localStorage.getItem('server_ip');
    const savedPort = localStorage.getItem('server_port');
    if (savedIp && savedPort) {
      const savedUrl = `http://${savedIp}:${savedPort}`;
      console.log('🔧 Using saved server configuration:', savedUrl);
      return savedUrl;
    }
    
    // Получаем текущий хост и порт
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // Определяем порт API на основе порта фронтенда
    let apiPort: string;
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      // Локальная разработка - используем тот же хост и порт
      apiPort = currentPort || '80';
    } else if (currentPort === '3000' || currentPort === '') {
      // Разработка - фронтенд на 3000, бэкенд через nginx на 80
      apiPort = '80';
    } else if (currentPort === '3001') {
      // Альтернативный порт разработки
      apiPort = '80';
    } else {
      // Продакшн - используем тот же порт (nginx проксирует на 80)
      apiPort = currentPort || '80';
    }
    
    // Определяем протокол
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    
    // Формируем URL
    const apiUrl = `${protocol}//${currentHost}:${apiPort}`;
    
    console.log(`🔧 API Configuration:`, {
      currentHost,
      currentPort,
      apiPort,
      protocol,
      apiUrl,
      envOverride: !!envApiUrl,
      savedConfig: savedIp ? `http://${savedIp}:${savedPort}` : null,
      environment: getCurrentEnvironment()
    });
    
    return apiUrl;
  }
  
  // Функция для получения конфигурации API
  export function getApiConfig(): ApiConfig {
    return {
      baseUrl: getApiBaseUrl(),
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'), // 30 секунд по умолчанию
      retries: parseInt(process.env.REACT_APP_API_RETRIES || '3')
    };
  }
  
  // Экспортируем базовый URL для обратной совместимости
  export const API_BASE = getApiBaseUrl();
  
  // Дополнительные настройки для разных окружений
  export const API_ENDPOINTS = {
    // Основные эндпоинты
    AUTH: {
      LOGIN: '/auth/token',
      REGISTER: '/auth/',
      USER_INFO: '/users/me'
    },
    
    // Данные о продуктах
    PRODUCTS: {
      LIST: '/csv-data/products-json',
      DETAILS: '/csv-data/product-details'
    },
    
    // Контрагенты
    CONTRAGENTS: {
      BY_NAME: '/GetContrpartnerByName',
      FIRST: '/GetContrpartnerFirst',
      ALL: '/GetContrpartnerAll'
    }
  };
  
  // Настройки для разных типов окружений
  export const ENVIRONMENT_CONFIG = {
    development: {
      apiUrl: 'http://localhost:8000',
      debug: true,
      logLevel: 'debug'
    },
    
    production: {
      apiUrl: getApiBaseUrl(),
      debug: false,
      logLevel: 'error'
    },
    
    staging: {
      apiUrl: getApiBaseUrl(),
      debug: true,
      logLevel: 'info'
    }
  };
  
  // Определение текущего окружения
  export function getCurrentEnvironment(): 'development' | 'production' | 'staging' {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    } else {
      return 'production';
    }
  }
  
  // Получение конфигурации для текущего окружения
  export function getEnvironmentConfig() {
    const env = getCurrentEnvironment();
    return ENVIRONMENT_CONFIG[env];
  }
  
  // Валидация URL API
  export function validateApiUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  // Универсальная функция fetch с таймаутом
  export async function fetchWithTimeout(
    url: string, 
    options: RequestInit = {}, 
    timeoutMs: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  // Функция для тестирования подключения к API
  export async function testApiConnection(): Promise<boolean> {
    try {
      const config = getApiConfig();
      const response = await fetchWithTimeout(`${config.baseUrl}/health`, {
        method: 'GET'
      }, 5000);
      
      return response.ok;
    } catch (error) {
      console.warn('API connection test failed:', error);
      return false;
    }
  }
  
  // Функция для получения информации о сервере
  export async function getServerInfo(): Promise<any> {
    try {
      const config = getApiConfig();
      const response = await fetchWithTimeout(`${config.baseUrl}/info`, {
        method: 'GET'
      }, 5000);
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.warn('Failed to get server info:', error);
      return null;
    }
  }
  