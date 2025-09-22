import asyncio 
import pandas as pd
import os
import json
from pathlib import Path
from parser_23MET import ParserSite_23MET
from proxyParser import ParserProxyLib
from preProcessor import PreProcessor
from update_config import change_update_config_json

async def main(with_proxy=False):
    print("Скрипт запущен!")
    script_dir = Path(__file__).parent.resolve()
    os.chdir(script_dir)
    
    change_update_config_json(os.path.join(os.getcwd(), 'config.json'))

    # Загружаем список сайтов из ALL_HREFS.json
    all_hrefs_file = os.path.join(os.getcwd(), 'GoogleHTML', 'ALL_HREFS.json')
    if not os.path.exists(all_hrefs_file):
        print(f"❌ Файл {all_hrefs_file} не найден!")
        return
    
    with open(all_hrefs_file, 'r', encoding='utf-8') as f:
        urls = json.load(f)
    
    print(f"📋 Загружено {len(urls)} сайтов для парсинга")

    if with_proxy:
        proxy = ParserProxyLib(max_rate=100, time_period=1)
        await proxy.parsing(url_for_checking='https://23met.ru/')
        proxy_list = proxy.get_sockets()
        if not proxy_list:
            proxy_list = None
        main_parser = ParserSite_23MET(max_rate=100, proxy_list=proxy_list)
    else:
        # Пример использования фильтрации - ищем только трубы ВГП
        filter_keywords = ["Труба ВГП", "Труба б/ш г/д", "Труба э/с"]
        main_parser = ParserSite_23MET(max_rate=100, 
                                      filter_keywords=filter_keywords, 
                                      filter_mode="any")
    
    # Устанавливаем список сайтов для парсинга
    main_parser.set_urls(urls)
    
    df = await main_parser.run(with_update_sites_info=False,
                              with_save_result=True,
                              with_remove_intermediate_data=False)

    # Проверяем, есть ли данные для обработки
    result_file = os.path.join(os.getcwd(), '23MET_DATA', 'result.csv')
    if os.path.exists(result_file) and os.path.getsize(result_file) > 0:
        print("Начинаю предобработку данных")
        preprocessor = PreProcessor(csv_file_path=result_file)
        
        preprocessing_file = os.path.join(os.getcwd(), '23MET_DATA', 'preprocessing_result.csv')
        print("Закончился препроцессинг. начинаю сохранять структурированные данные по пути:", preprocessing_file)
        preprocessor.save_data(path=preprocessing_file)
        
        # Загружаем обработанные данные для статистики
        processed_df = pd.read_csv(preprocessing_file, index_col=0)
        
        print(f"\n🎯 Итоговый результат:")
        print(f"   Обработанных записей: {len(processed_df)}")
        print(f"   Уникальных компаний: {processed_df['Компания'].nunique()}")
        print(f"   Уникальных товаров: {processed_df['Наименование'].nunique()}")
        
        print(f"\n💾 Файлы результатов:")
        print(f"   • preprocessing_result.csv - полные обработанные данные")
    else:
        print("⚠️ Нет данных для предобработки - файл result.csv пуст или не существует")
    
    print('Работа закончилась')

if __name__ == "__main__":
    asyncio.run(main())
