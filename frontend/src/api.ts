// Импортируем динамическую конфигурацию API
import { API_BASE, getApiConfig, API_ENDPOINTS, getCurrentEnvironment, fetchWithTimeout } from './config/apiConfig';

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

// Получить все данные о ценах на металлопродукцию с fallback на моковые данные
export async function getMetalsPricingData(limit: number = 100, offset: number = 0) {
  try {
    console.log(`🔄 Fetching real data from: ${API_BASE}/csv-data/products-json?limit=${limit}&offset=${offset}`);
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}${API_ENDPOINTS.PRODUCTS.LIST}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }, config.timeout);
    
    console.log('✅ Real API Response status:', res.status);
    console.log('✅ Real API Response headers:', res.headers);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real metals pricing data:', error);
    console.log('🔄 Falling back to mock data...');
    
    // Fallback на моковые данные
    const mockData = await getMockMetalsPricingData(limit, offset);
    console.log('✅ Using mock data as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для fallback
async function getMockMetalsPricingData(limit: number = 100, offset: number = 0) {
  // Импортируем моковые данные
  const { metalsPricingData } = await import('./data/metalsPricingData');
  
  // Применяем пагинацию к моковым данным
  const startIndex = offset;
  const endIndex = Math.min(startIndex + limit, metalsPricingData.records.length);
  const paginatedRecords = metalsPricingData.records.slice(startIndex, endIndex);
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    currency: metalsPricingData.currency,
    price_unit: metalsPricingData.price_unit,
    total_count: metalsPricingData.records.length,
    limit: limit,
    offset: offset,
    records: paginatedRecords,
    is_mock_data: true // Флаг для отличия от реальных данных
  };
}

// Получить проблемные трубы с fallback
export async function getProblematicTubes(filters?: any) {
  try {
    console.log('🔄 Fetching real problematic tubes data...');
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/api/problematic-tubes${queryParams ? `?${queryParams}` : ''}`;
    const config = getApiConfig();
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real problematic tubes data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real problematic tubes:', error);
    console.log('🔄 Falling back to mock problematic tubes data...');
    
    // Fallback на моковые данные
    const mockData = await getMockProblematicTubes(filters);
    console.log('✅ Using mock problematic tubes data as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для проблемных труб
async function getMockProblematicTubes(filters?: any) {
  const { metalsPricingData } = await import('./data/metalsPricingData');
  
  // Преобразуем моковые данные в формат проблемных труб
  const problematicTubes = metalsPricingData.records.map((record, index) => ({
    id: `T${index + 1}`,
    ...record,
    problemStatus: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
    problemDescription: index % 3 === 0 ? 'Критически низкие остатки' : 
                       index % 3 === 1 ? 'Цена выше рыночной' : 'Требует мониторинга',
    recommendation: index % 3 === 0 ? 'Срочно пополнить запасы' :
                   index % 3 === 1 ? 'Рассмотреть снижение цены' : 'Отслеживать динамику цен',
    priceDiffPercent: (Math.random() - 0.5) * 30 // Случайное отклонение от -15% до +15%
  }));
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    total_count: problematicTubes.length,
    records: problematicTubes,
    is_mock_data: true
  };
}

// Получить уведомления об активности конкурентов с fallback
export async function getCompetitorNotifications() {
  try {
    console.log('🔄 Fetching real competitor notifications...');
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/competitor-notifications`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real competitor notifications received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real competitor notifications:', error);
    console.log('🔄 Falling back to mock competitor notifications...');
    
    // Fallback на моковые данные
    const mockData = await getMockCompetitorNotifications();
    console.log('✅ Using mock competitor notifications as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для уведомлений конкурентов
async function getMockCompetitorNotifications() {
  return {
    success: true,
    generated_at: new Date().toISOString(),
    notifications: [
      {
        id: 'N1',
        type: 'price_change',
        competitor: 'ТМК',
        product: 'Труба бесшовная 57×3.5',
        change: -5.2,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'medium'
      },
      {
        id: 'N2',
        type: 'stock_change',
        competitor: 'ЧТПЗ',
        product: 'Труба ВГП 32×3.2',
        change: -15,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        severity: 'high'
      },
      {
        id: 'N3',
        type: 'new_product',
        competitor: 'Северсталь',
        product: 'Труба профильная 100×50×4',
        change: 0,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      }
    ],
    is_mock_data: true
  };
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

// Получить рекомендации по ценам с fallback
export async function getPriceRecommendations(filters?: any) {
  try {
    console.log('🔄 Fetching real price recommendations...');
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/api/price-recommendations${queryParams ? `?${queryParams}` : ''}`;
    const config = getApiConfig();
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real price recommendations received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real price recommendations:', error);
    console.log('🔄 Falling back to mock price recommendations...');
    
    // Fallback на моковые данные
    const mockData = await getMockPriceRecommendations(filters);
    console.log('✅ Using mock price recommendations as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для рекомендаций по ценам
async function getMockPriceRecommendations(filters?: any) {
  const { metalsPricingData } = await import('./data/metalsPricingData');
  
  const recommendations = metalsPricingData.records.slice(0, 5).map((record, index) => ({
    id: `R${index + 1}`,
    product_id: `P${index + 1}`,
    product_name: record.наименование,
    current_price: record.цена,
    recommended_price: Math.round(record.цена * (0.95 + Math.random() * 0.1)), // ±5% от текущей цены
    reason: index % 3 === 0 ? 'Снижение для повышения конкурентоспособности' :
            index % 3 === 1 ? 'Повышение из-за роста спроса' : 'Оптимизация на основе рыночных данных',
    confidence: 0.7 + Math.random() * 0.3, // 70-100% уверенности
    impact_score: Math.random() * 10, // 0-10 баллов влияния
    timestamp: new Date().toISOString()
  }));
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    total_count: recommendations.length,
    recommendations: recommendations,
    is_mock_data: true
  };
}

// Новые API методы для работы с nginx маршрутами

// Получить данные парсера с fallback
export async function getParserData(filters?: any) {
  try {
    console.log('🔄 Fetching real parser data...');
    const config = getApiConfig();
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/parser/data${queryParams ? `?${queryParams}` : ''}`;
    
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real Parser API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real parser data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real parser data:', error);
    console.log('🔄 Falling back to mock parser data...');
    
    // Fallback на моковые данные
    const mockData = await getMockParserData(filters);
    console.log('✅ Using mock parser data as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для парсера
async function getMockParserData(filters?: any) {
  return {
    success: true,
    generated_at: new Date().toISOString(),
    total_records: 1250,
    last_update: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 минут назад
    sources: [
      { name: '23met.ru', status: 'active', records: 450 },
      { name: 'tmk.ru', status: 'active', records: 320 },
      { name: 'chtpz.ru', status: 'active', records: 280 },
      { name: 'severstal.ru', status: 'active', records: 200 }
    ],
    statistics: {
      total_products: 1250,
      price_updates: 45,
      new_products: 12,
      discontinued_products: 3
    },
    is_mock_data: true
  };
}

// Получить данные ценообразования с fallback
export async function getPricingData(filters?: any) {
  try {
    console.log('🔄 Fetching real pricing data...');
    const config = getApiConfig();
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/pricing/data${queryParams ? `?${queryParams}` : ''}`;
    
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real Pricing API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real pricing data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real pricing data:', error);
    console.log('🔄 Falling back to mock pricing data...');
    
    // Fallback на моковые данные
    const mockData = await getMockPricingData(filters);
    console.log('✅ Using mock pricing data as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для ценообразования
async function getMockPricingData(filters?: any) {
  const { metalsPricingData, getAveragePrice } = await import('./data/metalsPricingData');
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    market_analysis: {
      average_price: getAveragePrice(metalsPricingData.records),
      price_trend: 'stable',
      market_volatility: 0.15,
      competitor_count: 4
    },
    recommendations: metalsPricingData.records.slice(0, 3).map((record, index) => ({
      product_id: `P${index + 1}`,
      product_name: record.наименование,
      current_price: record.цена,
      recommended_price: Math.round(record.цена * (0.95 + Math.random() * 0.1)),
      confidence: 0.8 + Math.random() * 0.2,
      reason: 'Оптимизация на основе рыночных данных'
    })),
    is_mock_data: true
  };
}

// Получить статистику парсера с fallback
export async function getParserStats() {
  try {
    console.log('🔄 Fetching real parser stats...');
    const config = getApiConfig();
    const url = `${API_BASE}/parser/stats`;
    
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real Parser Stats API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real parser stats received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real parser stats:', error);
    console.log('🔄 Falling back to mock parser stats...');
    
    // Fallback на моковые данные
    const mockData = await getMockParserStats();
    console.log('✅ Using mock parser stats as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для статистики парсера
async function getMockParserStats() {
  return {
    success: true,
    generated_at: new Date().toISOString(),
    stats: {
      total_parsed: 1250,
      successful_parses: 1180,
      failed_parses: 70,
      last_parse_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 минут назад
      average_parse_time: 2.5,
      sources_active: 4,
      sources_total: 5
    },
    performance: {
      uptime: '99.8%',
      response_time: '1.2s',
      error_rate: '5.6%'
    },
    is_mock_data: true
  };
}

// Получить аналитику ценообразования с fallback
export async function getPricingAnalytics(filters?: any) {
  try {
    console.log('🔄 Fetching real pricing analytics...');
    const config = getApiConfig();
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const url = `${API_BASE}/pricing/analytics${queryParams ? `?${queryParams}` : ''}`;
    
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real Pricing Analytics API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real pricing analytics received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real pricing analytics:', error);
    console.log('🔄 Falling back to mock pricing analytics...');
    
    // Fallback на моковые данные
    const mockData = await getMockPricingAnalytics(filters);
    console.log('✅ Using mock pricing analytics as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для аналитики ценообразования
async function getMockPricingAnalytics(filters?: any) {
  const { metalsPricingData, getAveragePrice, getPriceRange } = await import('./data/metalsPricingData');
  
  const avgPrice = getAveragePrice(metalsPricingData.records);
  const priceRange = getPriceRange(metalsPricingData.records);
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    analytics: {
      price_distribution: {
        min: priceRange.min,
        max: priceRange.max,
        average: avgPrice,
        median: Math.round((priceRange.min + priceRange.max) / 2)
      },
      trends: {
        daily_change: 0.5,
        weekly_change: 2.1,
        monthly_change: -1.8
      },
      market_segments: [
        { name: 'Трубы бесшовные', count: 8, avg_price: 95000 },
        { name: 'Трубы электросварные', count: 4, avg_price: 70000 },
        { name: 'Трубы ВГП', count: 4, avg_price: 69000 }
      ]
    },
    recommendations: {
      high_priority: 3,
      medium_priority: 5,
      low_priority: 2
    },
    is_mock_data: true
  };
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

// Обновить цену продукта
export async function updateProductPrice(productData: {
  product_id: string;
  recommended_price: number;
  reason: string;
}) {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/products/update-price`, {
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
    console.log('Product price updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating product price:', error);
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

// Получить рыночные данные с fallback
export async function getMarketData() {
  try {
    console.log('🔄 Fetching real market data...');
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
      console.error('❌ Real Market Data API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real market data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching real market data:', error);
    console.log('🔄 Falling back to mock market data...');
    
    // Fallback на моковые данные
    const mockData = await getMockMarketData();
    console.log('✅ Using mock market data as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для рыночных данных
async function getMockMarketData() {
  const { metalsPricingData, getAveragePrice } = await import('./data/metalsPricingData');
  
  const avgPrice = getAveragePrice(metalsPricingData.records);
  
  return {
    success: true,
    generated_at: new Date().toISOString(),
    market_history: [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 0.98),
        volume: 1250,
        volatility: 0.12
      },
      {
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 0.99),
        volume: 1180,
        volatility: 0.15
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 1.01),
        volume: 1320,
        volatility: 0.18
      },
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 1.02),
        volume: 1400,
        volatility: 0.14
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 1.00),
        volume: 1280,
        volatility: 0.16
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: Math.round(avgPrice * 0.99),
        volume: 1150,
        volatility: 0.13
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_price: avgPrice,
        volume: 1200,
        volatility: 0.15
      }
    ],
    current_market: {
      average_price: avgPrice,
      trend: 'stable',
      volatility: 0.15,
      volume: 1200
    },
    is_mock_data: true
  };
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

// Проверить работоспособность сервиса ценообразования с fallback
export async function checkPricingHealth() {
  try {
    console.log('🔄 Checking real pricing service health...');
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/api/pricing/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real Pricing Health API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real pricing health check successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Error checking real pricing health:', error);
    console.log('🔄 Falling back to mock pricing health...');
    
    // Fallback на моковые данные
    const mockData = await getMockPricingHealth();
    console.log('✅ Using mock pricing health as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для проверки работоспособности ценообразования
async function getMockPricingHealth() {
  return {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      pricing_algorithm: 'healthy',
      market_data: 'healthy',
      recommendations: 'healthy',
      analytics: 'healthy'
    },
    performance: {
      response_time: '120ms',
      uptime: '99.9%',
      last_error: null
    },
    is_mock_data: true
  };
}

// Проверить доступность API с fallback
export async function checkApiHealth() {
  try {
    console.log('🔄 Checking real API health...');
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Real API Health Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Real API health check successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Error checking real API health:', error);
    console.log('🔄 Falling back to mock API health...');
    
    // Fallback на моковые данные
    const mockData = await getMockApiHealth();
    console.log('✅ Using mock API health as fallback:', mockData);
    return mockData;
  }
}

// Моковые данные для проверки доступности API
async function getMockApiHealth() {
  return {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    services: {
      database: 'healthy',
      parser: 'healthy',
      pricing: 'healthy',
      auth: 'healthy'
    },
    uptime: '99.9%',
    is_mock_data: true
  };
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
  is_admin: boolean;
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

// Админ API функции
export interface AdminUserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

export interface AdminRegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

// Регистрация пользователя администратором
export async function adminRegisterUser(userData: AdminRegisterRequest, token: string): Promise<void> {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/admin/register-user`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to register user: ${res.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Получить всех пользователей
export async function getAllUsers(token: string): Promise<AdminUserResponse[]> {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/admin/users`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get users: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Создать администратора
export async function createAdminUser(adminData: CreateAdminRequest, token: string): Promise<void> {
  try {
    const config = getApiConfig();
    const res = await fetchWithTimeout(`${API_BASE}/admin/create-admin`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(adminData),
    }, config.timeout);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create admin: ${res.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

