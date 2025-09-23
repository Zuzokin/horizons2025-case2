import { checkApiHealth, getMetalsPricingData, getCompetitorNotifications } from '../api';

// Функция для тестирования подключения к API
export async function testApiConnection() {
  console.log('🔍 Тестирование подключения к API...');
  
  try {
    // Проверяем базовое подключение
    console.log('📡 Проверка health endpoint...');
    const health = await checkApiHealth();
    console.log('✅ API доступен:', health);
    
    // Проверяем получение данных о ценах
    console.log('📊 Получение данных о ценах...');
    const pricingData = await getMetalsPricingData();
    console.log('✅ Данные о ценах получены:', pricingData);
    
    // Проверяем уведомления
    console.log('🔔 Получение уведомлений...');
    const notifications = await getCompetitorNotifications();
    console.log('✅ Уведомления получены:', notifications);
    
    return {
      success: true,
      message: 'Все API endpoints работают корректно',
      data: {
        health,
        pricingData,
        notifications
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка подключения к API:', error);
    return {
      success: false,
      message: `Ошибка подключения: ${error}`,
      error
    };
  }
}

// Импортируем динамическую конфигурацию API
import { API_BASE } from '../config/apiConfig';

// Функция для получения информации о Swagger
export function getSwaggerUrl() {
  return `${API_BASE}/docs`;
}

// Функция для открытия Swagger в новой вкладке
export function openSwagger() {
  const swaggerUrl = getSwaggerUrl();
  window.open(swaggerUrl, '_blank');
  console.log('🔗 Swagger открыт:', swaggerUrl);
}
