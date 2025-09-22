#!/usr/bin/env python3
"""
Пример использования фильтрации в ParserSite_23MET
"""

import asyncio
from parser_23MET import ParserSite_23MET

async def example_filtering():
    """
    Примеры использования различных фильтров
    """
    
    print("=== Примеры фильтрации ParserSite_23MET ===\n")
    
    # Пример 1: Поиск только труб ВГП
    print("1. Поиск только труб ВГП:")
    parser1 = ParserSite_23MET(
        max_rate=100,
        filter_keywords=["труба", "вгп"],
        filter_mode="any"  # Любое из слов
    )
    print(f"   Фильтр: {parser1._ParserSite_23MET__filter_keywords}")
    print(f"   Режим: {parser1._ParserSite_23MET__filter_mode}\n")
    
    # Пример 2: Поиск арматуры определенного размера
    print("2. Поиск арматуры размером 12:")
    parser2 = ParserSite_23MET(
        max_rate=100,
        filter_keywords=["арматура", "12"],
        filter_mode="all"  # Все слова должны присутствовать
    )
    print(f"   Фильтр: {parser2._ParserSite_23MET__filter_keywords}")
    print(f"   Режим: {parser2._ParserSite_23MET__filter_mode}\n")
    
    # Пример 3: Поиск листовой стали
    print("3. Поиск листовой стали:")
    parser3 = ParserSite_23MET(
        max_rate=100,
        filter_keywords=["лист", "сталь"],
        filter_mode="any"
    )
    print(f"   Фильтр: {parser3._ParserSite_23MET__filter_keywords}")
    print(f"   Режим: {parser3._ParserSite_23MET__filter_mode}\n")
    
    # Пример 4: Динамическое изменение фильтра
    print("4. Динамическое изменение фильтра:")
    parser4 = ParserSite_23MET(max_rate=100)
    print("   Изначально без фильтра")
    
    parser4.set_filter(["труба", "металлическая"], "any")
    parser4.set_filter(["арматура", "а500с"], "all")
    
    print("\n=== Доступные режимы фильтрации ===")
    print("- 'any': Любое из ключевых слов должно присутствовать в таблице")
    print("- 'all': Все ключевые слова должны присутствовать в таблице")
    print("\n=== Рекомендации ===")
    print("- Используйте 'any' для широкого поиска (например: ['труба', 'вгп'])")
    print("- Используйте 'all' для точного поиска (например: ['арматура', '12', 'а500с'])")
    print("- Ключевые слова не чувствительны к регистру")
    print("- Фильтрация происходит по содержимому всех таблиц на странице")

if __name__ == "__main__":
    asyncio.run(example_filtering())
