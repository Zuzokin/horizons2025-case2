"""
Контроллер для API ценообразования
"""
from fastapi import APIRouter, HTTPException
from typing import List
import logging
from src.pricing.models import (
    PricingRequest, 
    PricingRecommendationResponse, 
    MarketDataUpdate,
    BulkPricingRequest
)
from src.pricing.service import pricing_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pricing", tags=["pricing"])


@router.post("/recommend", response_model=PricingRecommendationResponse)
async def get_price_recommendation(request: PricingRequest):
    """
    Получить рекомендацию по цене для одного продукта
    """
    try:
        logger.info(f"Получен запрос на рекомендацию цены для {request.наименование}")
        recommendation = pricing_service.get_price_recommendation(request)
        return recommendation
    except Exception as e:
        logger.error(f"Ошибка при получении рекомендации цены: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend/bulk", response_model=List[PricingRecommendationResponse])
async def get_bulk_price_recommendations(request: BulkPricingRequest):
    """
    Получить рекомендации по ценам для нескольких продуктов
    """
    try:
        logger.info(f"Получен запрос на массовые рекомендации для {len(request.products)} продуктов")
        recommendations = pricing_service.get_bulk_price_recommendations(request.products)
        return recommendations
    except Exception as e:
        logger.error(f"Ошибка при получении массовых рекомендаций: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/market-data/update")
async def update_market_data(market_data: MarketDataUpdate):
    """
    Обновить рыночные данные
    """
    try:
        logger.info(f"Обновление рыночных данных")
        success = pricing_service.update_market_data(market_data.market_history)
        if success:
            return {"message": "Рыночные данные успешно обновлены"}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при обновлении рыночных данных")
    except Exception as e:
        logger.error(f"Ошибка при обновлении рыночных данных: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market-data")
async def get_market_data():
    """
    Получить текущие рыночные данные
    """
    try:
        market_data = pricing_service.get_market_data()
        return market_data
    except Exception as e:
        logger.error(f"Ошибка при получении рыночных данных: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def pricing_health_check():
    """
    Проверка работоспособности сервиса ценообразования
    """
    try:
        # Проверяем доступность алгоритма и данных
        market_data = pricing_service.get_market_data()
        competitors_data = pricing_service._get_competitors_data()
        
        return {
            "status": "healthy",
            "market_data_points": len(market_data.get("market_history", [])),
            "competitors_data_points": len(competitors_data),
            "algorithm_available": True
        }
    except Exception as e:
        logger.error(f"Ошибка при проверке здоровья сервиса: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.post("/test-recommend", response_model=PricingRecommendationResponse)
async def test_price_recommendation(request: PricingRequest):
    """
    Тестовый endpoint для получения рекомендации по цене БЕЗ авторизации
    """
    try:
        logger.info(f"Тестовый запрос на рекомендацию цены для {request.наименование}")
        recommendation = pricing_service.get_price_recommendation(request)
        return recommendation
    except Exception as e:
        logger.error(f"Ошибка при получении тестовой рекомендации цены: {e}")
        raise HTTPException(status_code=500, detail=str(e))
