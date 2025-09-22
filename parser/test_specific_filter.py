#!/usr/bin/env python3
"""
Тест специфической фильтрации для поиска только труб ВГП
"""

import asyncio
import os
from parser_23MET import ParserSite_23MET

async def test_tube_filtering():
    """
    Тестируем фильтрацию для поиска только труб ВГП
    """
    
    print("=== Тест фильтрации для труб ВГП ===\n")
    
    # Создаем парсер с более точным фильтром
    parser = ParserSite_23MET(
        max_rate=100,
        filter_keywords=["труба вгп", "труба водогазопроводная"],
        filter_mode="any"
    )
    
    print(f"🔍 Фильтр: {parser._ParserSite_23MET__filter_keywords}")
    print(f"🔍 Режим: {parser._ParserSite_23MET__filter_mode}")
    
    # Запускаем парсинг
    df = await parser.run(
        with_update_sites_info=False,
        with_save_result=True,
        with_remove_intermediate_data=True
    )
    
    print(f"\n📊 Результат: {len(df)} записей")
    
    if len(df) > 0:
        print("\n📋 Примеры найденных товаров:")
        unique_names = df['Наименование'].unique()[:10]
        for i, name in enumerate(unique_names, 1):
            print(f"  {i}. {name}")
    else:
        print("\n⚠️ Товары не найдены - попробуйте другие ключевые слова")

if __name__ == "__main__":
    asyncio.run(test_tube_filtering())
