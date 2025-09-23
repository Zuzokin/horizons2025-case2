"""
Алгоритм рекомендации цен на металлопродукцию
Основан на cost-plus модели с учетом рыночных индексов и конкурентного анализа
"""
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from statistics import median
import logging
from src.data.market_data import MarketPoint, market_data_service

logger = logging.getLogger(__name__)


@dataclass
class PricingRecommendation:
    """Результат рекомендации по ценообразованию"""
    action: str  # "повысить", "понизить", "оставить", "установить"
    delta_percent: Optional[float]  # процент изменения
    new_price: int  # новая рекомендуемая цена
    baseline_target_cost_plus: int  # целевая цена на основе cost-plus
    market_anchor_median: Optional[int]  # медианная цена конкурентов
    blend_lambda_market_weight: float  # вес рыночного якоря
    final_target_price: int  # итоговая целевая цена
    competitors_used: int  # количество использованных конкурентов
    history_points: int  # количество точек истории
    confidence: float  # уверенность в рекомендации (0.2-0.9)
    explain: str  # объяснение рекомендации


class PricingAlgorithm:
    """Алгоритм ценообразования"""
    
    def __init__(self):
        self.neutral_threshold = 0.015  # 1.5% нейтральная зона
        self.max_step = 0.03  # 3% максимальный шаг изменения
        self.min_competitors = 3  # минимальное количество конкурентов для надежного анализа
    
    def _norm_series(self, values: List[float], window: int = 6) -> float:
        """Нормализует серию значений относительно среднего за окно"""
        if not values:
            return 1.0
        w = min(window, len(values))
        base = sum(values[-w:]) / w
        return (values[-1] / base) if base else 1.0
    
    def _compute_cost_index(self, history: List[MarketPoint]) -> Dict[str, float]:
        """Вычисляет индекс себестоимости на основе рыночных данных"""
        scrap_vals = [p.scrap for p in history]
        coil_vals = [p.coil for p in history]
        usd_vals = [p.usd for p in history if p.usd is not None]
        rate_vals = [p.rate for p in history if p.rate is not None]
        
        scrap_norm = self._norm_series(scrap_vals)
        coil_norm = self._norm_series(coil_vals)
        usd_norm = self._norm_series(usd_vals) if len(usd_vals) == len(history) else None
        rate_norm = self._norm_series(rate_vals) if len(rate_vals) == len(history) else None
        
        # Определяем веса в зависимости от доступности данных
        has_fx = usd_norm is not None
        has_rate = rate_norm is not None
        
        if has_fx and has_rate:
            w_coil, w_scrap, w_fx, w_rate = 0.6, 0.3, 0.07, 0.03
        elif has_fx and not has_rate:
            w_coil, w_scrap, w_fx, w_rate = 0.62, 0.33, 0.05, 0.0
        elif not has_fx and has_rate:
            w_coil, w_scrap, w_fx, w_rate = 0.62, 0.35, 0.0, 0.03
        else:
            w_coil, w_scrap, w_fx, w_rate = 0.67, 0.33, 0.0, 0.0
        
        cost_index = w_coil * coil_norm + w_scrap * scrap_norm
        if has_fx:
            cost_index += w_fx * usd_norm
        if has_rate:
            cost_index += w_rate * rate_norm
        
        # Вычисляем предыдущий индекс для baseline
        def last_norm(vals: List[float]) -> float:
            if len(vals) < 2:
                return 1.0
            w = min(6, len(vals) - 1)
            base = sum(vals[-1-w:-1]) / w
            return (vals[-2] / base) if base else 1.0
        
        prev_cost_index = None
        if len(history) >= 2:
            scrap_prev = last_norm(scrap_vals)
            coil_prev = last_norm(coil_vals)
            ci_prev = w_coil * coil_prev + w_scrap * scrap_prev
            if has_fx:
                usd_prev = last_norm([p.usd for p in history])
                ci_prev += w_fx * usd_prev
            if has_rate:
                rate_prev = last_norm([p.rate for p in history])
                ci_prev += w_rate * rate_prev
            prev_cost_index = ci_prev
        
        return {
            "current": cost_index,
            "prev": prev_cost_index if prev_cost_index is not None else cost_index
        }
    
    def _find_competitors(self, payload: Dict[str, Any], competitors_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Находит конкурентов по заданным критериям"""
        def normalize(x):
            return str(x or "").strip().lower()
        
        target_gost = normalize(payload.get("ГОСТ"))
        target_name = normalize(payload.get("наименование"))
        target_mark = normalize(payload.get("марка_стали"))
        target_diam = normalize(payload.get("диаметр"))
        target_region = normalize(payload.get("регион"))
        
        def by_filters(rows, use_mark=True, use_region=True):
            res = []
            for r in rows:
                gost = normalize(r.get("ГОСТ"))
                size = normalize(r.get("Размер") or r.get("Размер_A") or r.get("Типоразмер"))
                mark = normalize(r.get("Основная_марка") or r.get("Марка"))
                city = normalize(r.get("Город"))
                
                ok = True
                if target_gost and gost and target_gost not in gost:
                    ok = False
                if ok and target_diam and size and target_diam not in size:
                    ok = False
                if ok and use_mark and target_mark and mark and target_mark != mark:
                    ok = False
                if ok and use_region and target_region and city and target_region != city:
                    ok = False
                if ok:
                    res.append(r)
            return res
        
        # Пробуем разные уровни фильтрации
        rows = by_filters(competitors_data, use_mark=True, use_region=True)
        if len(rows) < self.min_competitors:
            rows = by_filters(competitors_data, use_mark=False, use_region=True)
        if len(rows) < self.min_competitors:
            rows = by_filters(competitors_data, use_mark=False, use_region=False)
        
        return rows
    
    def recommend_price(
        self,
        payload: Dict[str, Any],
        competitors_data: List[Dict[str, Any]]
    ) -> PricingRecommendation:
        """Основная функция рекомендации цены"""
        try:
            # Получаем рыночные данные
            market_history = market_data_service.get_market_history()
            
            # 1) Вычисляем индекс себестоимости
            ci = self._compute_cost_index(market_history)
            ci_curr, ci_prev = ci["current"], ci["prev"]
            
            # 2) Базовый cost-plus таргет
            our_price = float(payload.get("цена", 0) or 0)
            base_price = our_price / (ci_prev if ci_prev else 1.0)
            baseline_target = base_price * ci_curr
            
            # 3) Анализ конкурентов
            competitors = self._find_competitors(payload, competitors_data)
            comp_prices = [
                float(r.get("Цена")) 
                for r in competitors 
                if r.get("Цена") not in (None, "", "False", False)
            ]
            market_anchor = median(comp_prices) if comp_prices else None
            
            # 4) Смешивание таргетов
            n_comp = len(comp_prices)
            lam = 0.3 + 0.5 * min(1.0, n_comp / 5.0)  # 0.3..0.8
            
            if market_anchor is None:
                target_price = baseline_target
                lam = 0.0
            else:
                target_price = (1 - lam) * baseline_target + lam * market_anchor
            
            # 5) Принятие решения
            if our_price <= 0:
                action = "установить"
                delta_pct = None
                new_price = round(target_price)
            else:
                gap = (target_price - our_price) / our_price
                
                if abs(gap) <= self.neutral_threshold:
                    action = "оставить"
                    delta_pct = 0.0
                    new_price = round(our_price)
                elif gap > 0:
                    action = "повысить"
                    delta_pct = min(self.max_step, gap)
                    new_price = round(our_price * (1 + delta_pct))
                else:
                    action = "понизить"
                    delta_pct = min(self.max_step, abs(gap))
                    new_price = round(our_price * (1 - delta_pct))
            
            # 6) Вычисление уверенности
            conf = 0.5
            if n_comp >= self.min_competitors:
                conf += 0.2
            if len(market_history) >= 12:
                conf += 0.1
            
            # Проверяем полноту данных по курсу и ставке
            has_fx = all(p.usd is not None for p in market_history)
            has_rate = all(p.rate is not None for p in market_history)
            if has_fx:
                conf += 0.05
            if has_rate:
                conf += 0.05
            
            conf = max(0.2, min(0.9, conf))
            
            # 7) Формирование объяснения
            explain_parts = []
            if lam > 0.5:
                explain_parts.append("Основной вес на рыночные цены конкурентов")
            else:
                explain_parts.append("Основной вес на себестоимость (рулон/лом)")
            
            if n_comp >= self.min_competitors:
                explain_parts.append(f"найдено {n_comp} конкурентов")
            else:
                explain_parts.append("мало конкурентов для анализа")
            
            explain_parts.append("шаг изменения ограничен 3%, нейтральная зона ±1.5%")
            explain = ". ".join(explain_parts) + "."
            
            return PricingRecommendation(
                action=action,
                delta_percent=round(delta_pct * 100, 2) if delta_pct is not None else None,
                new_price=new_price,
                baseline_target_cost_plus=round(baseline_target),
                market_anchor_median=round(market_anchor) if market_anchor else None,
                blend_lambda_market_weight=round(lam, 2),
                final_target_price=round(target_price),
                competitors_used=n_comp,
                history_points=len(market_history),
                confidence=round(conf, 2),
                explain=explain
            )
            
        except Exception as e:
            logger.error(f"Ошибка в алгоритме ценообразования: {e}")
            # Возвращаем безопасную рекомендацию
            return PricingRecommendation(
                action="оставить",
                delta_percent=0.0,
                new_price=int(payload.get("цена", 0) or 0),
                baseline_target_cost_plus=int(payload.get("цена", 0) or 0),
                market_anchor_median=None,
                blend_lambda_market_weight=0.0,
                final_target_price=int(payload.get("цена", 0) or 0),
                competitors_used=0,
                history_points=0,
                confidence=0.2,
                explain="Ошибка в алгоритме. Рекомендуется оставить текущую цену."
            )


# Глобальный экземпляр алгоритма
pricing_algorithm = PricingAlgorithm()
