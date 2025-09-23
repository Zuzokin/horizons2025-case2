import { getMetalsPricingData } from '../api';

export interface RealMetalPricingRecord {
  "вид_продукции": string;
  "склад": string;
  "наименование": string;
  "марка_стали": string;
  "диаметр": string;
  "ГОСТ": string;
  "цена": number;
  "наличие": string;
  "производитель": string;
  "регион": string;
}

export interface ProblematicTubeRecord extends RealMetalPricingRecord {
  id: string;
  problemStatus: string;
  problemDescription: string;
  recommendation: string;
  priceDiffPercent: number;
}

export interface RealMetalsPricingResponse {
  success: boolean;
  generated_at: string;
  currency: string;
  price_unit: string;
  total_count: number;
  limit: number;
  offset: number;
  records: RealMetalPricingRecord[];
}

// Кэш для данных
let cachedData: RealMetalsPricingResponse | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

// Функция для получения данных с кэшированием
export async function fetchRealMetalsPricingData(limit: number = 1000, offset: number = 0): Promise<RealMetalsPricingResponse> {
  const now = Date.now();
  
  // Если данные в кэше и не устарели, возвращаем их
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached data');
    return cachedData;
  }
  
  try {
    console.log('Fetching fresh data from API...');
    const data = await getMetalsPricingData(limit, offset);
    cachedData = data;
    lastFetchTime = now;
    console.log('Data cached successfully');
    return data;
  } catch (error) {
    console.error('Error fetching real metals pricing data:', error);
    
    // Возвращаем кэшированные данные в случае ошибки
    if (cachedData) {
      console.log('Using cached data due to API error');
      return cachedData;
    }
    
    // Если нет кэшированных данных, возвращаем fallback данные
    console.log('Using fallback data');
    return getFallbackData();
  }
}

// Fallback данные в случае недоступности API
function getFallbackData(): RealMetalsPricingResponse {
  return {
    success: true,
    generated_at: new Date().toISOString(),
    currency: "RUB",
    price_unit: "руб/т",
    total_count: 5,
    limit: 1000,
    offset: 0,
    records: [
      {
        "вид_продукции": "Габарит",
        "склад": "Москва",
        "наименование": "Труба ВГП",
        "марка_стали": "1",
        "диаметр": "15х2.5",
        "ГОСТ": "ГОСТ 3262-75",
        "цена": 60690,
        "наличие": "в наличии (50 т)",
        "производитель": "Новосталь-Маркет",
        "регион": "ЦФО"
      },
      {
        "вид_продукции": "Габарит",
        "склад": "Краснодар",
        "наименование": "Труба ВГП",
        "марка_стали": "не указан",
        "диаметр": "50х3.5",
        "ГОСТ": "ГОСТ 3262-75",
        "цена": 61500,
        "наличие": "в наличии (50 т)",
        "производитель": "Сталепромышленная компания",
        "регион": "ЮФО"
      },
      {
        "вид_продукции": "Габарит",
        "склад": "Краснодар",
        "наименование": "Труба ВГП",
        "марка_стали": "не указан",
        "диаметр": "40х3.5",
        "ГОСТ": "ГОСТ 3262-75",
        "цена": 63500,
        "наличие": "в наличии (50 т)",
        "производитель": "Сталепромышленная компания",
        "регион": "ЮФО"
      },
      {
        "вид_продукции": "Профиль ГОСТ/СТО",
        "склад": "Краснодар",
        "наименование": "Труба ВГП",
        "марка_стали": "не указан",
        "диаметр": "40х3",
        "ГОСТ": "ГОСТ 3262-75",
        "цена": 63500,
        "наличие": "в наличии (50 т)",
        "производитель": "Сталепромышленная компания",
        "регион": "ЮФО"
      },
      {
        "вид_продукции": "Габарит",
        "склад": "Краснодар",
        "наименование": "Труба ВГП",
        "марка_стали": "не указан",
        "диаметр": "32х3.2",
        "ГОСТ": "ГОСТ 3262-75",
        "цена": 63500,
        "наличие": "в наличии (50 т)",
        "производитель": "Сталепромышленная компания",
        "регион": "ЮФО"
      }
    ]
  };
}

// Функции для работы с данными (аналогично старому файлу)
export const getUniqueValues = (records: RealMetalPricingRecord[], field: keyof RealMetalPricingRecord): string[] => {
  const values = new Set(records.map(record => String(record[field])));
  return Array.from(values).sort();
};

export const getFilteredRecords = (
  records: RealMetalPricingRecord[],
  filters: {
    productType: string;
    warehouse: string;
    name: string;
    steelGrade: string;
    diameter: string;
    gost: string;
  }
): RealMetalPricingRecord[] => {
  console.log('🔍 getFilteredRecords called with', records.length, 'records');
  console.log('🔍 Filters:', filters);
  
  const filtered = records.filter(record => {
    // Фильтр по типу продукции
    if (filters.productType && filters.productType !== 'Все типы') {
      const productType = record['вид_продукции']?.toLowerCase() || '';
      const filterValue = filters.productType.toLowerCase();
      if (!productType.includes(filterValue)) {
        console.log('🔍 Filtered out by product type:', record['наименование'], 'vs', filters.productType);
        return false;
      }
    }
    
    // Фильтр по складу
    if (filters.warehouse && filters.warehouse !== 'Все склады') {
      const warehouse = record['склад']?.toLowerCase() || '';
      const filterValue = filters.warehouse.toLowerCase();
      if (!warehouse.includes(filterValue)) {
        console.log('🔍 Filtered out by warehouse:', record['наименование'], 'vs', filters.warehouse);
        return false;
      }
    }
    
    // Фильтр по наименованию
    if (filters.name && filters.name !== 'Все наименования') {
      if (!record['наименование']?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
    }
    
    // Фильтр по марке стали
    if (filters.steelGrade && filters.steelGrade !== 'Все марки') {
      if (!record['марка_стали']?.toLowerCase().includes(filters.steelGrade.toLowerCase())) {
        return false;
      }
    }
    
    // Фильтр по диаметру
    if (filters.diameter && filters.diameter !== 'Все диаметры') {
      if (!record['диаметр']?.toLowerCase().includes(filters.diameter.toLowerCase())) {
        return false;
      }
    }
    
    // Фильтр по ГОСТ
    if (filters.gost && filters.gost !== 'Все ГОСТы') {
      if (!record['ГОСТ']?.toLowerCase().includes(filters.gost.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log('🔍 Filtered result:', filtered.length, 'records');
  return filtered;
};

export const getAveragePrice = (records: RealMetalPricingRecord[]): number => {
  if (records.length === 0) return 0;
  const validPrices = records.filter(record => record.цена != null && record.цена > 0);
  if (validPrices.length === 0) return 0;
  const total = validPrices.reduce((sum, record) => sum + record.цена, 0);
  return total / validPrices.length;
};

export const getPriceRange = (records: RealMetalPricingRecord[]): { min: number, max: number } => {
  if (records.length === 0) return { min: 0, max: 0 };
  const validPrices = records
    .map(record => record.цена)
    .filter(price => price != null && price > 0);
  if (validPrices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...validPrices), max: Math.max(...validPrices) };
};

// Функция для обработки всех труб как проблемных (требующих мониторинга)
export const getProblematicTubesFromRealData = (records: RealMetalPricingRecord[]): ProblematicTubeRecord[] => {
  console.log('🔍 getProblematicTubesFromRealData called with', records.length, 'records');
  
  // Фильтруем только трубы (исключаем арматуру, уголки и т.д.)
  const tubeRecords = records.filter(record => {
    const productType = record['вид_продукции']?.toLowerCase() || '';
    const name = record['наименование']?.toLowerCase() || '';
    
    // Включаем только трубы
    const isTube = productType.includes('труба') || 
                   productType.includes('габарит') || 
                   productType.includes('профиль') ||
                   name.includes('труба') ||
                   name.includes('габарит') ||
                   name.includes('профиль');
    
    // Исключаем арматуру, уголки, швеллеры и т.д.
    const isNotTube = productType.includes('арматура') ||
                      productType.includes('уголок') ||
                      productType.includes('швеллер') ||
                      productType.includes('балка') ||
                      productType.includes('лист') ||
                      productType.includes('проволока') ||
                      name.includes('арматура') ||
                      name.includes('уголок') ||
                      name.includes('швеллер') ||
                      name.includes('балка') ||
                      name.includes('лист') ||
                      name.includes('проволока');
    
    return isTube && !isNotTube;
  });
  
  console.log('🔍 Filtered tube records:', tubeRecords.length);
  
  const avgPrice = getAveragePrice(tubeRecords);
  
  return tubeRecords.map((record, index) => {
    // Проверяем, что цена существует и является числом
    const price = record['цена'] || 0;
    const priceDiff = price - avgPrice;
    const priceDiffPercent = avgPrice > 0 ? (priceDiff / avgPrice) * 100 : 0;
    
    // Определяем статус проблемы - все трубы считаются проблемными
    let problemStatus = 'medium'; // По умолчанию средний риск
    let problemDescription = '';
    let recommendation = '';
    
    // Приоритизируем по различным критериям
    if (record['наличие'] && record['наличие'].includes('мало')) {
      problemStatus = 'high';
      problemDescription = 'Критически низкие остатки';
      recommendation = 'Срочно пополнить запасы';
    } else if (record['наличие'] && record['наличие'].includes('под заказ')) {
      problemStatus = 'high';
      problemDescription = 'Высокий спрос';
      recommendation = 'Увеличить производство';
    } else if (priceDiffPercent > 15) {
      problemStatus = 'high';
      problemDescription = 'Цена значительно выше рыночной';
      recommendation = 'Рассмотреть снижение цены';
    } else if (priceDiffPercent < -10) {
      problemStatus = 'medium';
      problemDescription = 'Цена ниже рыночной';
      recommendation = 'Возможность повышения цены';
    } else {
      // Для всех остальных труб
      problemStatus = 'medium';
      problemDescription = 'Требует мониторинга';
      recommendation = 'Отслеживать динамику цен';
    }
    
    return {
      ...record,
      id: `T${index + 1}`,
      problemStatus,
      problemDescription,
      recommendation,
      priceDiffPercent
    };
  });
};
