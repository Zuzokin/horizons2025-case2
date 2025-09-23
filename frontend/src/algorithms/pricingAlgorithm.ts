// Алгоритм ценообразования для ТМК на основе анализа конкурентов
// Генерирует рекомендации по корректировке цен для менеджеров

export interface CompetitorPrice {
  competitor: string;
  price: number;
  region: string;
  availability: string;
  quality: 'premium' | 'standard' | 'budget';
  deliveryTime: number; // дни
}

export interface MarketPosition {
  position: 'leader' | 'follower' | 'challenger' | 'niche';
  marketShare: number;
  brandStrength: number; // 0-1
}

export interface PricingRecommendation {
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  recommendation: 'increase' | 'decrease' | 'maintain';
  confidence: number; // 0-1
  reasoning: string[];
  risks: string[];
  expectedImpact: {
    volumeChange: number; // %
    revenueChange: number; // %
    marketShareChange: number; // %
  };
  implementationPriority: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'medium_term';
}

export interface PricingContext {
  productType: string;
  steelGrade: string;
  diameter: string;
  region: string;
  currentInventory: number;
  demandLevel: 'high' | 'medium' | 'low';
  seasonality: number; // -1 to 1
  costBase: number;
  marginTarget: number; // %
}

// Основной класс алгоритма ценообразования
export class TMKPricingAlgorithm {
  private competitorPrices: CompetitorPrice[] = [];
  private marketPosition: MarketPosition;
  private pricingContext: PricingContext;

  constructor(
    competitorPrices: CompetitorPrice[],
    marketPosition: MarketPosition,
    pricingContext: PricingContext
  ) {
    this.competitorPrices = competitorPrices;
    this.marketPosition = marketPosition;
    this.pricingContext = pricingContext;
  }

  // Основной метод генерации рекомендаций
  public generateRecommendation(): PricingRecommendation {
    const currentPrice = this.pricingContext.costBase * (1 + this.pricingContext.marginTarget / 100);
    
    // Анализируем конкурентную среду
    const competitorAnalysis = this.analyzeCompetitors();
    
    // Рассчитываем оптимальную цену
    const optimalPrice = this.calculateOptimalPrice(competitorAnalysis);
    
    // Определяем рекомендацию
    const recommendation = this.determineRecommendation(currentPrice, optimalPrice);
    
    // Рассчитываем ожидаемое воздействие
    const expectedImpact = this.calculateExpectedImpact(currentPrice, optimalPrice);
    
    // Генерируем обоснование
    const reasoning = this.generateReasoning(competitorAnalysis, recommendation);
    
    // Оцениваем риски
    const risks = this.assessRisks(recommendation, expectedImpact);
    
    // Определяем приоритет и временные рамки
    const priority = this.determinePriority(recommendation, expectedImpact);
    const timeframe = this.determineTimeframe(recommendation, priority);
    
    // Рассчитываем уверенность в рекомендации
    const confidence = this.calculateConfidence(competitorAnalysis, recommendation);

    return {
      currentPrice,
      recommendedPrice: optimalPrice,
      priceChange: optimalPrice - currentPrice,
      priceChangePercent: ((optimalPrice - currentPrice) / currentPrice) * 100,
      recommendation: recommendation.type,
      confidence,
      reasoning,
      risks,
      expectedImpact,
      implementationPriority: priority,
      timeframe
    };
  }

  // Анализ конкурентной среды
  private analyzeCompetitors() {
    const validPrices = this.competitorPrices.filter(cp => cp.price > 0);
    
    if (validPrices.length === 0) {
      return {
        averagePrice: this.pricingContext.costBase * 1.2,
        medianPrice: this.pricingContext.costBase * 1.2,
        priceRange: { min: this.pricingContext.costBase, max: this.pricingContext.costBase * 1.5 },
        competitorCount: 0,
        marketLeader: null,
        priceVolatility: 0
      };
    }

    const prices = validPrices.map(cp => cp.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = this.calculateMedian(prices);
    const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };
    
    // Находим лидера рынка (самый дешевый с хорошим качеством)
    const marketLeader = validPrices
      .filter(cp => cp.quality === 'premium' || cp.quality === 'standard')
      .sort((a, b) => a.price - b.price)[0];
    
    // Рассчитываем волатильность цен
    const priceVolatility = this.calculateVolatility(prices);

    return {
      averagePrice,
      medianPrice,
      priceRange,
      competitorCount: validPrices.length,
      marketLeader,
      priceVolatility
    };
  }

  // Расчет оптимальной цены
  private calculateOptimalPrice(competitorAnalysis: any): number {
    const { averagePrice, medianPrice, marketLeader, priceVolatility } = competitorAnalysis;
    const { costBase, marginTarget, demandLevel } = this.pricingContext;
    
    // Базовый расчет на основе себестоимости
    const costBasedPrice = costBase * (1 + marginTarget / 100);
    
    // Конкурентный анализ
    const competitorBasedPrice = this.calculateCompetitorBasedPrice(competitorAnalysis);
    
    // Спрос и сезонность
    const demandMultiplier = this.getDemandMultiplier(demandLevel);
    const seasonalityMultiplier = 1 + (this.pricingContext.seasonality * 0.1);
    
    // Позиция на рынке
    const positionMultiplier = this.getPositionMultiplier(this.marketPosition);
    
    // Волатильность рынка
    const volatilityAdjustment = 1 + (priceVolatility * 0.05);
    
    // Взвешенная цена
    const weights = {
      cost: 0.3,
      competitor: 0.4,
      demand: 0.2,
      position: 0.1
    };
    
    const optimalPrice = (
      costBasedPrice * weights.cost +
      competitorBasedPrice * weights.competitor +
      averagePrice * weights.demand +
      medianPrice * weights.position
    ) * demandMultiplier * seasonalityMultiplier * positionMultiplier * volatilityAdjustment;
    
    // Ограничения
    const minPrice = costBase * 1.05; // Минимум 5% маржа
    const maxPrice = costBase * 2.0;  // Максимум 100% маржа
    
    return Math.max(minPrice, Math.min(maxPrice, optimalPrice));
  }

  // Расчет цены на основе конкурентов
  private calculateCompetitorBasedPrice(competitorAnalysis: any): number {
    const { averagePrice, medianPrice, marketLeader } = competitorAnalysis;
    
    switch (this.marketPosition.position) {
      case 'leader':
        // Лидер может устанавливать цену выше среднерыночной
        return averagePrice * 1.05;
      
      case 'challenger':
        // Вызов лидеру - цена чуть ниже лидера
        return marketLeader ? marketLeader.price * 0.98 : averagePrice * 0.95;
      
      case 'follower':
        // Следование за лидером
        return marketLeader ? marketLeader.price * 1.02 : averagePrice;
      
      case 'niche':
        // Нишевая позиция - премиум цена
        return averagePrice * 1.1;
      
      default:
        return averagePrice;
    }
  }

  // Определение рекомендации
  private determineRecommendation(currentPrice: number, optimalPrice: number) {
    const priceDifference = Math.abs(optimalPrice - currentPrice);
    const priceDifferencePercent = (priceDifference / currentPrice) * 100;
    
    if (priceDifferencePercent < 2) {
      return { type: 'maintain' as const, strength: 'weak' };
    } else if (optimalPrice > currentPrice) {
      return { type: 'increase' as const, strength: priceDifferencePercent > 10 ? 'strong' : 'moderate' };
    } else {
      return { type: 'decrease' as const, strength: priceDifferencePercent > 10 ? 'strong' : 'moderate' };
    }
  }

  // Расчет ожидаемого воздействия
  private calculateExpectedImpact(currentPrice: number, optimalPrice: number) {
    const priceChangePercent = ((optimalPrice - currentPrice) / currentPrice) * 100;
    
    // Эластичность спроса (зависит от типа продукта и рынка)
    const elasticity = this.getPriceElasticity();
    
    // Изменение объема продаж
    const volumeChange = -priceChangePercent * elasticity;
    
    // Изменение выручки
    const revenueChange = priceChangePercent + volumeChange + (priceChangePercent * volumeChange / 100);
    
    // Изменение доли рынка
    const marketShareChange = this.calculateMarketShareChange(priceChangePercent, volumeChange);
    
    return {
      volumeChange: Math.round(volumeChange * 10) / 10,
      revenueChange: Math.round(revenueChange * 10) / 10,
      marketShareChange: Math.round(marketShareChange * 10) / 10
    };
  }

  // Генерация обоснования
  private generateReasoning(competitorAnalysis: any, recommendation: any): string[] {
    const reasoning: string[] = [];
    
    if (competitorAnalysis.competitorCount > 0) {
      reasoning.push(`Анализ ${competitorAnalysis.competitorCount} конкурентов показывает среднерыночную цену ${competitorAnalysis.averagePrice.toLocaleString()} руб/т`);
    }
    
    if (competitorAnalysis.marketLeader) {
      reasoning.push(`Лидер рынка ${competitorAnalysis.marketLeader.competitor} предлагает цену ${competitorAnalysis.marketLeader.price.toLocaleString()} руб/т`);
    }
    
    if (this.pricingContext.demandLevel === 'high') {
      reasoning.push('Высокий спрос позволяет увеличить цену');
    } else if (this.pricingContext.demandLevel === 'low') {
      reasoning.push('Низкий спрос требует снижения цены для стимулирования продаж');
    }
    
    if (this.pricingContext.seasonality > 0.3) {
      reasoning.push('Сезонный рост спроса поддерживает повышение цен');
    } else if (this.pricingContext.seasonality < -0.3) {
      reasoning.push('Сезонное снижение спроса требует корректировки цен');
    }
    
    if (this.marketPosition.position === 'leader') {
      reasoning.push('Лидерская позиция позволяет устанавливать премиальные цены');
    } else if (this.marketPosition.position === 'challenger') {
      reasoning.push('Позиция вызова требует агрессивного ценообразования');
    }
    
    return reasoning;
  }

  // Оценка рисков
  private assessRisks(recommendation: any, expectedImpact: any): string[] {
    const risks: string[] = [];
    
    if (recommendation.type === 'increase' && expectedImpact.volumeChange < -15) {
      risks.push('Значительное снижение объема продаж может привести к потере клиентов');
    }
    
    if (recommendation.type === 'decrease' && expectedImpact.revenueChange < -5) {
      risks.push('Снижение цены может негативно повлиять на маржинальность');
    }
    
    if (expectedImpact.marketShareChange < -2) {
      risks.push('Риск потери доли рынка');
    }
    
    if (this.pricingContext.currentInventory > 1000) {
      risks.push('Высокие остатки требуют осторожного подхода к ценообразованию');
    }
    
    return risks;
  }

  // Определение приоритета
  private determinePriority(recommendation: any, expectedImpact: any): 'high' | 'medium' | 'low' {
    const priceChangePercent = Math.abs(expectedImpact.revenueChange);
    
    if (priceChangePercent > 10 || expectedImpact.marketShareChange > 5) {
      return 'high';
    } else if (priceChangePercent > 5 || expectedImpact.marketShareChange > 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Определение временных рамок
  private determineTimeframe(recommendation: any, priority: 'high' | 'medium' | 'low'): 'immediate' | 'short_term' | 'medium_term' {
    if (priority === 'high') {
      return 'immediate';
    } else if (priority === 'medium') {
      return 'short_term';
    } else {
      return 'medium_term';
    }
  }

  // Расчет уверенности
  private calculateConfidence(competitorAnalysis: any, recommendation: any): number {
    let confidence = 0.5; // Базовая уверенность
    
    // Больше конкурентов = больше уверенности
    if (competitorAnalysis.competitorCount > 5) {
      confidence += 0.2;
    } else if (competitorAnalysis.competitorCount > 2) {
      confidence += 0.1;
    }
    
    // Низкая волатильность = больше уверенности
    if (competitorAnalysis.priceVolatility < 0.1) {
      confidence += 0.15;
    } else if (competitorAnalysis.priceVolatility < 0.2) {
      confidence += 0.1;
    }
    
    // Сильная рекомендация = больше уверенности
    if (recommendation.strength === 'strong') {
      confidence += 0.1;
    }
    
    return Math.min(0.95, Math.max(0.1, confidence));
  }

  // Вспомогательные методы
  private calculateMedian(prices: number[]): number {
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculateVolatility(prices: number[]): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean;
  }

  private getDemandMultiplier(demandLevel: string): number {
    switch (demandLevel) {
      case 'high': return 1.05;
      case 'medium': return 1.0;
      case 'low': return 0.95;
      default: return 1.0;
    }
  }

  private getPositionMultiplier(position: any): number {
    switch (position.position) {
      case 'leader': return 1.05;
      case 'challenger': return 0.98;
      case 'follower': return 1.0;
      case 'niche': return 1.1;
      default: return 1.0;
    }
  }

  private getPriceElasticity(): number {
    // Эластичность зависит от типа продукта
    const productType = this.pricingContext.productType.toLowerCase();
    
    if (productType.includes('труба б/ш')) return 0.8; // Низкая эластичность для премиум продуктов
    if (productType.includes('труба э/с')) return 1.2; // Средняя эластичность
    if (productType.includes('труба вгп')) return 1.5; // Высокая эластичность для стандартных продуктов
    
    return 1.0; // Базовая эластичность
  }

  private calculateMarketShareChange(priceChangePercent: number, volumeChange: number): number {
    // Упрощенная модель изменения доли рынка
    const baseMarketShare = this.marketPosition.marketShare;
    const marketShareChange = (volumeChange / 100) * baseMarketShare;
    return marketShareChange;
  }
}

// Фабрика для создания экземпляров алгоритма
export class PricingAlgorithmFactory {
  static createForProduct(
    productData: any,
    competitorPrices: CompetitorPrice[],
    marketPosition: MarketPosition
  ): TMKPricingAlgorithm {
    const pricingContext: PricingContext = {
      productType: productData['вид_продукции'] || 'Неизвестно',
      steelGrade: productData['марка_стали'] || 'Неизвестно',
      diameter: productData['диаметр'] || 'Неизвестно',
      region: productData['регион'] || 'Неизвестно',
      currentInventory: 50, // Предполагаем стандартные остатки
      demandLevel: this.assessDemandLevel(productData),
      seasonality: this.calculateSeasonality(),
      costBase: this.estimateCostBase(productData),
      marginTarget: this.getMarginTarget(productData)
    };

    return new TMKPricingAlgorithm(competitorPrices, marketPosition, pricingContext);
  }

  private static assessDemandLevel(productData: any): 'high' | 'medium' | 'low' {
    const availability = productData['наличие'] || '';
    
    if (availability.includes('мало') || availability.includes('под заказ')) {
      return 'high';
    } else if (availability.includes('в наличии')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static calculateSeasonality(): number {
    const month = new Date().getMonth();
    // Упрощенная модель сезонности для металлопродукции
    // Пик спроса весной и осенью
    if (month >= 2 && month <= 4) return 0.3; // Весна
    if (month >= 8 && month <= 10) return 0.2; // Осень
    if (month >= 5 && month <= 7) return -0.1; // Лето
    return -0.2; // Зима
  }

  private static estimateCostBase(productData: any): number {
    const currentPrice = productData['цена'] || 0;
    // Предполагаем базовую маржу 20-30%
    return currentPrice * 0.75;
  }

  private static getMarginTarget(productData: any): number {
    const productType = productData['вид_продукции'] || '';
    
    if (productType.includes('б/ш')) return 25; // Премиум маржа для бесшовных труб
    if (productType.includes('э/с')) return 20; // Стандартная маржа для электросварных
    if (productType.includes('вгп')) return 15; // Низкая маржа для ВГП
    
    return 20; // Базовая маржа
  }
}
