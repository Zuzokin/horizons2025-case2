"""
Модели для системы ценообразования
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class PricingRequest(BaseModel):
    """Запрос на получение рекомендации по цене"""
    вид_продукции: str = Field(..., description="Вид продукции")
    склад: str = Field(..., description="Склад")
    наименование: str = Field(..., description="Наименование")
    марка_стали: str = Field(..., description="Марка стали")
    диаметр: str = Field(..., description="Диаметр")
    ГОСТ: str = Field(..., description="ГОСТ")
    цена: float = Field(..., description="Текущая цена")
    производитель: str = Field(..., description="Производитель")
    регион: str = Field(..., description="Регион")


class PricingRecommendationResponse(BaseModel):
    """Ответ с рекомендацией по ценообразованию"""
    input: Dict[str, Any] = Field(..., description="Входные данные")
    decision: Dict[str, Any] = Field(..., description="Решение")
    targets: Dict[str, Any] = Field(..., description="Целевые значения")
    coverage: Dict[str, Any] = Field(..., description="Покрытие данных")
    confidence: float = Field(..., description="Уверенность в рекомендации")
    explain: str = Field(..., description="Объяснение рекомендации")


class MarketDataUpdate(BaseModel):
    """Обновление рыночных данных"""
    market_history: List[Dict[str, Any]] = Field(..., description="История рыночных данных")


class BulkPricingRequest(BaseModel):
    """Запрос на получение рекомендаций для нескольких позиций"""
    products: List[PricingRequest] = Field(..., description="Список продуктов")
