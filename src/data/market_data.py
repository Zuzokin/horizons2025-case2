"""
Модуль для работы с рыночными данными для алгоритма ценообразования
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime
import json


@dataclass
class MarketPoint:
    """Точка рыночных данных за месяц"""
    month: str  # "YYYY-MM"
    scrap: float        # цена лома (руб/т)
    coil: float         # цена рулона (руб/т)
    usd: Optional[float] = None  # курс USD/RUB
    eur: Optional[float] = None  # курс EUR/RUB
    rate: Optional[float] = None  # ключевая ставка ЦБ (%)


class MarketDataService:
    """Сервис для работы с рыночными данными"""
    
    def __init__(self):
        self.market_history = self._load_default_data()
    
    def _load_default_data(self) -> List[MarketPoint]:
        """Загружает базовые рыночные данные за последний год"""
        return [
            MarketPoint("2024-09", 31200, 61800, 95.5, 102.3, 16.0),
            MarketPoint("2024-10", 30500, 60200, 96.2, 103.1, 16.0),
            MarketPoint("2024-11", 30800, 60500, 97.8, 104.5, 16.0),
            MarketPoint("2024-12", 31000, 61000, 98.1, 105.2, 16.0),
            MarketPoint("2025-01", 30600, 60400, 99.5, 106.8, 16.0),
            MarketPoint("2025-02", 30200, 59800, 100.2, 107.5, 16.0),
            MarketPoint("2025-03", 31400, 61600, 101.8, 108.9, 16.0),
            MarketPoint("2025-04", 32100, 62500, 102.5, 109.6, 16.0),
            MarketPoint("2025-05", 32800, 63200, 103.2, 110.3, 16.0),
            MarketPoint("2025-06", 33500, 64000, 104.1, 111.2, 16.0),
            MarketPoint("2025-07", 33200, 63600, 103.8, 110.9, 16.0),
            MarketPoint("2025-08", 32900, 63200, 103.5, 110.6, 16.0),
        ]
    
    def get_market_history(self) -> List[MarketPoint]:
        """Возвращает историю рыночных данных"""
        return self.market_history
    
    def add_market_point(self, point: MarketPoint):
        """Добавляет новую точку рыночных данных"""
        self.market_history.append(point)
    
    def update_market_data(self, data: List[Dict[str, Any]]):
        """Обновляет рыночные данные из внешнего источника"""
        self.market_history = []
        for item in data:
            point = MarketPoint(
                month=item.get("month", ""),
                scrap=float(item.get("scrap", 0)),
                coil=float(item.get("coil", 0)),
                usd=float(item.get("usd")) if item.get("usd") is not None else None,
                eur=float(item.get("eur")) if item.get("eur") is not None else None,
                rate=float(item.get("rate")) if item.get("rate") is not None else None,
            )
            self.market_history.append(point)
    
    def get_latest_data(self) -> Optional[MarketPoint]:
        """Возвращает последние рыночные данные"""
        return self.market_history[-1] if self.market_history else None
    
    def to_dict(self) -> Dict[str, Any]:
        """Конвертирует данные в словарь для JSON сериализации"""
        return {
            "market_history": [
                {
                    "month": point.month,
                    "scrap": point.scrap,
                    "coil": point.coil,
                    "usd": point.usd,
                    "eur": point.eur,
                    "rate": point.rate
                }
                for point in self.market_history
            ]
        }


# Глобальный экземпляр сервиса
market_data_service = MarketDataService()
