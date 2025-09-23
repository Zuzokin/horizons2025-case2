"""
Сервис ценообразования
"""
import logging
from typing import List, Dict, Any, Optional
from src.algorithms.pricing_algorithm import pricing_algorithm, PricingRecommendation
from src.data.market_data import market_data_service
from src.csv_data.service import csv_data_service
from src.pricing.models import PricingRequest, PricingRecommendationResponse

logger = logging.getLogger(__name__)


class PricingService:
    """Сервис для работы с ценообразованием"""
    
    def __init__(self):
        self.algorithm = pricing_algorithm
        self.market_data = market_data_service
        self.csv_data = csv_data_service
    
    def get_price_recommendation(self, request: PricingRequest) -> PricingRecommendationResponse:
        """Получает рекомендацию по цене для одного продукта"""
        try:
            # Конвертируем запрос в словарь для алгоритма
            payload = {
                "вид_продукции": request.вид_продукции,
                "склад": request.склад,
                "наименование": request.наименование,
                "марка_стали": request.марка_стали,
                "диаметр": request.диаметр,
                "ГОСТ": request.ГОСТ,
                "цена": request.цена,
                "производитель": request.производитель,
                "регион": request.регион
            }
            
            # Получаем данные конкурентов
            competitors_data = self._get_competitors_data()
            
            # Получаем рекомендацию от алгоритма
            recommendation = self.algorithm.recommend_price(payload, competitors_data)
            
            # Формируем ответ
            response = PricingRecommendationResponse(
                input=payload,
                decision={
                    "action": recommendation.action,
                    "delta_percent": recommendation.delta_percent,
                    "new_price": recommendation.new_price,
                },
                targets={
                    "baseline_target_cost_plus": recommendation.baseline_target_cost_plus,
                    "market_anchor_median": recommendation.market_anchor_median,
                    "blend_lambda_market_weight": recommendation.blend_lambda_market_weight,
                    "final_target_price": recommendation.final_target_price,
                },
                coverage={
                    "competitors_used": recommendation.competitors_used,
                    "history_points": recommendation.history_points,
                },
                confidence=recommendation.confidence,
                explain=recommendation.explain
            )
            
            logger.info(f"Рекомендация по цене получена для {request.наименование}: {recommendation.action}")
            return response
            
        except Exception as e:
            logger.error(f"Ошибка при получении рекомендации по цене: {e}")
            raise
    
    def get_bulk_price_recommendations(self, requests: List[PricingRequest]) -> List[PricingRecommendationResponse]:
        """Получает рекомендации по ценам для нескольких продуктов"""
        recommendations = []
        for request in requests:
            try:
                recommendation = self.get_price_recommendation(request)
                recommendations.append(recommendation)
            except Exception as e:
                logger.error(f"Ошибка при обработке запроса для {request.наименование}: {e}")
                # Добавляем пустую рекомендацию в случае ошибки
                recommendations.append(self._create_error_recommendation(request))
        
        return recommendations
    
    def _get_competitors_data(self) -> List[Dict[str, Any]]:
        """Получает данные конкурентов из CSV"""
        try:
            # Получаем данные из CSV сервиса
            data = self.csv_data.get_all_products()
            return data if data else []
        except Exception as e:
            logger.error(f"Ошибка при получении данных конкурентов: {e}")
            return []
    
    def _create_error_recommendation(self, request: PricingRequest) -> PricingRecommendationResponse:
        """Создает рекомендацию об ошибке"""
        payload = {
            "вид_продукции": request.вид_продукции,
            "склад": request.склад,
            "наименование": request.наименование,
            "марка_стали": request.марка_стали,
            "диаметр": request.диаметр,
            "ГОСТ": request.ГОСТ,
            "цена": request.цена,
            "производитель": request.производитель,
            "регион": request.регион
        }
        
        return PricingRecommendationResponse(
            input=payload,
            decision={
                "action": "оставить",
                "delta_percent": 0.0,
                "new_price": int(request.цена),
            },
            targets={
                "baseline_target_cost_plus": int(request.цена),
                "market_anchor_median": None,
                "blend_lambda_market_weight": 0.0,
                "final_target_price": int(request.цена),
            },
            coverage={
                "competitors_used": 0,
                "history_points": 0,
            },
            confidence=0.2,
            explain="Ошибка при обработке запроса. Рекомендуется оставить текущую цену."
        )
    
    def update_market_data(self, market_data: List[Dict[str, Any]]) -> bool:
        """Обновляет рыночные данные"""
        try:
            self.market_data.update_market_data(market_data)
            logger.info("Рыночные данные успешно обновлены")
            return True
        except Exception as e:
            logger.error(f"Ошибка при обновлении рыночных данных: {e}")
            return False
    
    def get_market_data(self) -> Dict[str, Any]:
        """Получает текущие рыночные данные"""
        return self.market_data.to_dict()


# Глобальный экземпляр сервиса
pricing_service = PricingService()
