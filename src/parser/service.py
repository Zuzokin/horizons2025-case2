import asyncio
import pandas as pd
import os
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import sys
from parser.parser_23MET import ParserSite_23MET
from parser.proxyParser import ParserProxyLib
from parser.preProcessor import PreProcessor
from parser.update_config import change_update_config_json

# Добавляем путь к модулям парсера
parser_path = Path(__file__).parent.parent.parent / "parser"
sys.path.insert(0, str(parser_path))

try:
    from parser_23MET import ParserSite_23MET
    from proxyParser import ParserProxyLib
    from preProcessor import PreProcessor
    from update_config import change_update_config_json
except ImportError as e:
    print(f"Warning: Could not import parser modules: {e}")
    ParserSite_23MET = None
    ParserProxyLib = None
    PreProcessor = None
    change_update_config_json = None


class ParserService:
    def __init__(self):
        self.parser_path = Path(__file__).parent.parent.parent / "parser"

    async def run_parsing(self, with_proxy: bool = False, filter_keywords: Optional[list] = None) -> Dict[str, Any]:
        """
        Запускает процесс парсинга
        """
        if not all([ParserSite_23MET, PreProcessor, change_update_config_json]):
            return {
                "success": False,
                "error": "Parser modules not available. Please check parser installation."
            }

        try:
            # Переходим в директорию парсера
            original_cwd = os.getcwd()
            os.chdir(self.parser_path)

            # Обновляем конфигурацию
            change_update_config_json(os.path.join(os.getcwd(), 'config.json'))

            # Загружаем список сайтов
            all_hrefs_file = os.path.join(os.getcwd(), 'GoogleHTML', 'ALL_HREFS.json')
            if not os.path.exists(all_hrefs_file):
                return {
                    "success": False,
                    "error": f"File {all_hrefs_file} not found"
                }

            with open(all_hrefs_file, 'r', encoding='utf-8') as f:
                urls = json.load(f)

            # Настраиваем парсер
            if with_proxy:
                proxy = ParserProxyLib(max_rate=100, time_period=1)
                await proxy.parsing(url_for_checking='https://23met.ru/')
                proxy_list = proxy.get_sockets()
                if not proxy_list:
                    proxy_list = None
                main_parser = ParserSite_23MET(max_rate=100, proxy_list=proxy_list)
            else:
                if filter_keywords is None:
                    filter_keywords = ["Труба ВГП", "Труба б/ш г/д", "Труба э/с"]

                main_parser = ParserSite_23MET(
                    max_rate=100,
                    filter_keywords=filter_keywords,
                    filter_mode="any"
                )

            # Устанавливаем список сайтов для парсинга
            main_parser.set_urls(urls)

            # Запускаем парсинг
            df = await main_parser.run(
                with_update_sites_info=False,
                with_save_result=True,
                with_remove_intermediate_data=False
            )

            # Проверяем результат
            result_file = os.path.join(os.getcwd(), '23MET_DATA', 'result.csv')
            if os.path.exists(result_file) and os.path.getsize(result_file) > 0:
                # Создаем папку results если её нет
                results_dir = os.path.join(os.getcwd(), 'results')
                os.makedirs(results_dir, exist_ok=True)
                
                # Создаем уникальное имя файла с timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                result_filename = f"result_{timestamp}.csv"
                preprocessing_filename = f"preprocessing_result_{timestamp}.csv"
                
                # Копируем исходный файл в папку results
                result_file_copy = os.path.join(results_dir, result_filename)
                shutil.copy2(result_file, result_file_copy)
                
                # Обрабатываем данные
                preprocessor = PreProcessor(csv_file_path=result_file_copy)
                preprocessing_file = os.path.join(results_dir, preprocessing_filename)
                preprocessor.save_data(path=preprocessing_file)

                processed_df = pd.read_csv(preprocessing_file, index_col=0)

                os.chdir(original_cwd)

                return {
                    "success": True,
                    "message": "Parsing completed successfully",
                    "records_count": len(processed_df),
                    "data_file": preprocessing_file,
                    "result_file": result_file_copy,
                    "timestamp": timestamp,
                    "preview": processed_df.head(10).to_dict('records')
                }
            else:
                os.chdir(original_cwd)
                return {
                    "success": False,
                    "error": "No data found after parsing"
                }

        except Exception as e:
            os.chdir(original_cwd)
            return {
                "success": False,
                "error": f"Parsing failed: {str(e)}"
            }

    def get_csv_data(self, csv_file_path: str) -> Dict[str, Any]:
        """
        Получает данные из CSV файла
        """
        try:
            if not os.path.exists(csv_file_path):
                return {
                    "success": False,
                    "error": f"File {csv_file_path} not found"
                }

            df = pd.read_csv(csv_file_path, index_col=0)
            
            return {
                "success": True,
                "data": df,
                "records_count": len(df)
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"CSV read failed: {str(e)}"
            }


