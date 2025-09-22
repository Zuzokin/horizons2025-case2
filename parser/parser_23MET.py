import aiohttp
import asyncio
import aiolimiter
from bs4 import BeautifulSoup

import os
import pandas as pd
from typing import Union

from parser.GoogleParser import GoogleParser
from parser.base import Parser


class ParserSite_23MET(Parser):
    def __init__(self, 
                 base_url: str= "https://23met.ru",
                 proxy_list: list= None,
                 max_rate: int= 1,
                 time_period: int= 10,
                 filter_keywords: list= None,
                 filter_mode: str= "any"):
        """
        Args:
            base_url (str, optional): доменное имя сайта. Defaults to "https://23met.ru".
            proxy_list (list, optional): Список прокси адресов. Defaults to None.
            max_rate (int, optional): Количество запросов за time_period. Defaults to 1.
            time_period (int, optional): Время за которое выполняется max_rate запросов. Defaults to 10.
            filter_keywords (list, optional): Список ключевых слов для фильтрации. Defaults to None.
            filter_mode (str, optional): Режим фильтрации: "any" (любое слово) или "all" (все слова). Defaults to "any".
        """

        super().__init__(base_url, proxy_list)
        self.__limiter = aiolimiter.AsyncLimiter(max_rate= max_rate,
                                                 time_period= time_period)
        self.__filter_keywords = filter_keywords or []
        self.__filter_mode = filter_mode
        DIR_NAME = "23MET_DATA"
        os.makedirs(DIR_NAME, exist_ok=True)
        self._dir_path = os.path.join(os.getcwd(), DIR_NAME) 
        self.__file_paths = None
        self.__unique_columns_name = None
        self.__custom_urls = None

    def set_urls(self, urls: list):
        """
        Устанавливает список URL для парсинга вместо использования Google поиска
        Args:
            urls (list): Список URL для парсинга
        """
        self.__custom_urls = urls
        print(f"✅ Установлен список из {len(urls)} сайтов для парсинга")

    async def __get_and_save_site_data(self, 
                                       session: aiohttp.ClientSession, 
                                       url:str, 
                                       accept: str) -> None:
        """
        Получение html страницы и ее сохранение в файл  
        Args:
            session (aiohttp.ClientSession): Сессия
            url (str): url 
            accept (str, optional): типы файлов, которые клиент может принять (отображается браузером в header-e). Defaults to '*/*'.
        Returns:
            None
        """
        data = await self.get_html(session= session,
                                   url= url,
                                   accept= accept)
        if self.__checking(data):
            file_path = os.path.join(self._dir_path, url.split('/')[-1] + ".html")
            await self.put_file(path= file_path, data= data)
    
    async def __process_single_url_with_limiter(self,
                                                session: aiohttp.ClientSession, 
                                                url:str, 
                                                accept: str) -> None:
        """
        Получение html страницы и ее сохранение в файл, но с ограничением по количеству запросов за определенное время. Настройка кол-ва запросов за определенное время производится при инициализации объекта, с помощью параметров max_rate и time_period.
        Args:
            session (aiohttp.ClientSession): Сессия
            url (str): url 
            accept (str, optional): типы файлов, которые клиент может принять (отображается браузером в header-e). Defaults to '*/*'.
        Returns:
            None
        """
        async with self.__limiter:
            await self.__get_and_save_site_data(session=session, url=url, accept=accept)

    def __checking(self, 
                   html: str) -> bool:
        """
        Проверяет подходящий ли сайт или нет
        Args:
            html (str): код html страницы

        Returns:
            bool: True- подходит, False - неподходит
        """
        try:
            soup = BeautifulSoup(html, 'lxml')
        except TypeError:
            print(html, "тип None")
            return False
        
        # Проверяем заголовок страницы
        title_tag = soup.find('title')
        if title_tag is not None:
            title_text = title_tag.text.lower()
            # Более мягкая проверка - ищем ключевые слова
            if 'прайс' in title_text and '23met' in title_text:
                # Если есть фильтры по ключевым словам, проверяем содержимое таблиц
                if self.__filter_keywords:
                    return self.__check_table_content(soup)
                return True
        return False
    
    def __check_table_content(self, soup: BeautifulSoup) -> bool:
        """
        Проверяет содержимое таблиц на наличие ключевых слов
        Args:
            soup (BeautifulSoup): объект BeautifulSoup страницы

        Returns:
            bool: True- подходит под фильтр, False - не подходит
        """
        tables = soup.find_all('table', 'tablesorter')
        
        if not tables:
            return False
        
        # Собираем весь текст из таблиц
        table_texts = []
        for table in tables:
            table_text = table.get_text().lower()
            table_texts.append(table_text)
        
        # Объединяем весь текст
        all_text = ' '.join(table_texts)
        
        # Проверяем наличие ключевых слов
        if self.__filter_mode == "any":
            # Любое из ключевых слов должно присутствовать
            return any(keyword.lower() in all_text for keyword in self.__filter_keywords)
        elif self.__filter_mode == "all":
            # Все ключевые слова должны присутствовать
            return all(keyword.lower() in all_text for keyword in self.__filter_keywords)
        
        return False
    
    def __check_row_content(self, td_elements: list) -> bool:
        """
        Проверяет содержимое строки таблицы на наличие ключевых слов
        Args:
            td_elements (list): Список элементов td в строке

        Returns:
            bool: True- строка подходит под фильтр, False - не подходит
        """
        if not self.__filter_keywords:
            return True  # Если фильтр не установлен, все строки проходят
        
        # Собираем весь текст из ячеек строки
        row_text = ' '.join([td.text.strip() for td in td_elements]).lower()
        
        # Проверяем наличие ключевых слов
        if self.__filter_mode == "any":
            # Любое из ключевых слов должно присутствовать
            return any(keyword.lower() in row_text for keyword in self.__filter_keywords)
        elif self.__filter_mode == "all":
            # Все ключевые слова должны присутствовать
            return all(keyword.lower() in row_text for keyword in self.__filter_keywords)
        
        return True
    
    def __extract_company_info(self, soup: BeautifulSoup) -> dict:
        """
        Извлекает информацию о компании и городе из заголовка страницы
        Args:
            soup (BeautifulSoup): объект BeautifulSoup страницы

        Returns:
            dict: словарь с ключами 'company' и 'city'
        """
        company_info = {'company': None, 'city': None}
        
        try:
            # Способ 1: Извлечение из title
            title_tag = soup.find('title')
            if title_tag:
                title_text = title_tag.text.strip()
                # Формат: "УТК-Сталь | Москва | прайс-лист — 23MET.ru"
                if '|' in title_text:
                    parts = title_text.split('|')
                    if len(parts) >= 2:
                        company_info['company'] = parts[0].strip()
                        city_part = parts[1].strip()
                        # Убираем "прайс-лист" если есть
                        if 'прайс-лист' in city_part:
                            city_part = city_part.split('прайс-лист')[0].strip()
                        company_info['city'] = city_part
            
            # Способ 2: Извлечение из meta description
            if not company_info['company'] or not company_info['city']:
                meta_desc = soup.find('meta', {'name': 'description'})
                if meta_desc and meta_desc.get('content'):
                    desc_text = meta_desc.get('content')
                    # Формат: "прайс-лист УТК-Сталь Москва"
                    if 'прайс-лист' in desc_text:
                        parts = desc_text.replace('прайс-лист', '').strip().split()
                        if len(parts) >= 2:
                            company_info['company'] = parts[0]
                            company_info['city'] = parts[1]
            
            # Способ 3: Извлечение из h1 заголовка (если есть)
            if not company_info['company'] or not company_info['city']:
                h1_tag = soup.find('h1', class_='h1_plist')
                if h1_tag:
                    h1_text = h1_tag.text.strip()
                    # Формат: "УТК-Сталь | Москва"
                    if '|' in h1_text:
                        parts = h1_text.split('|')
                        if len(parts) >= 2:
                            company_info['company'] = parts[0].strip()
                            company_info['city'] = parts[1].strip()
            
            # Способ 4: Извлечение из div с id="plist-page-title"
            if not company_info['company'] or not company_info['city']:
                title_div = soup.find('div', id='plist-page-title')
                if title_div:
                    h1_in_div = title_div.find('h1', class_='h1_plist')
                    if h1_in_div:
                        h1_text = h1_in_div.text.strip()
                        if '|' in h1_text:
                            parts = h1_text.split('|')
                            if len(parts) >= 2:
                                company_info['company'] = parts[0].strip()
                                company_info['city'] = parts[1].strip()
            
        except Exception as e:
            print(f"Ошибка при извлечении информации о компании: {e}")
        
        # Если ничего не найдено, используем значения по умолчанию
        if not company_info['company']:
            company_info['company'] = 'Неизвестная компания'
        if not company_info['city']:
            company_info['city'] = 'Неизвестный город'
        
        return company_info
    
    def set_filter(self, keywords: list, mode: str = "any") -> None:
        """
        Устанавливает фильтр для парсинга
        Args:
            keywords (list): Список ключевых слов для фильтрации
            mode (str): Режим фильтрации: "any" (любое слово) или "all" (все слова)
        """
        self.__filter_keywords = keywords
        self.__filter_mode = mode
        print(f"Установлен фильтр: {keywords} (режим: {mode})")

    async def save_data(self,
                        accept: str= '*/*',
                        with_update_sites_info: bool= False,
                        num: int= 100,
                        start: int= 0,
                        stop: int= 100) -> None:
        """
        Получает данные со всех сайтов (выданных Google-поиском) и сохраняет их в файлы 
        Args:
            accept (str, optional): типы файлов, которые клиент может принять (отображается браузером в header-e). Defaults to '*/*'
            with_update_sites_info (bool, optional): Просто обновить все сайты или полностью спарсить и Google-поиск?. Defaults to False.
            num (int, optional): Кол-во сайтов отображаемое Googl-ом на одной ее html странице . Defaults to 100.
            start (int, optional): С какого сайта начать отображать страницы в Google поиске. Defaults to 0.
            stop (int, optional): На каком сайте закончить отображать страницы в Google поиске. Defaults to 100.
        Returns:
            None
        """
        
        # Используем кастомные URL если они установлены, иначе Google поиск
        if self.__custom_urls:
            urls = self.__custom_urls
            print(f"🔄 Используем кастомный список из {len(urls)} сайтов")
        else:
            google_searcher = GoogleParser(query_for_browser= 'site:23met.ru прайс-лист')
            if with_update_sites_info:
                await google_searcher.run(num= num, 
                                          start= start, 
                                          stop= stop)
            else:
                await google_searcher.parsing()
            
            urls = google_searcher.get_urls()
            
        async with aiohttp.ClientSession() as session:
            tasks = []
            for url in urls:
                task = asyncio.create_task(self.__process_single_url_with_limiter(session= session, url= url, accept= accept))
                tasks.append(task)
            await asyncio.gather(*tasks)
    
    async def __get_one_site_unique_columns_name(self, 
                                                 file_path: str) -> Union[None, set]:
        """
        Ищет уникальное название колонки для одного сайта(file_path)
        Args:
            file_path (str): абсолютный путь к файлу

        Returns:
            Union[None, set]: Если None, то не нашлось уникальных названий колонок
        """

        html = await self.get_file(file_path)
        unique_column_names = set()
        if self.__checking(html):
            soup = BeautifulSoup(html, 'lxml')
            tables = soup.find_all('table', 'tablesorter')
            for table in tables:
                table: BeautifulSoup
                columns_name = table.find('thead').find_all('th')
                for column_name in columns_name:
                    unique_column_names.add(column_name.text)
            return unique_column_names
        else:
            return None
        
    async def __get_all_unique_columns_name(self) -> list:
        """
        Возвращает список всех уникальных названий колонок со всех сайтов
        Returns:
            list: список всех уникальных названий колонок со всех сайтов
        """
        tasks = []
        if not self.__file_paths:
            print("Не был инициализирован self.__file_paths. Создаю его сам")
            file_names = os.listdir(self._dir_path)
            self.__file_paths = [os.path.join(self._dir_path, file_name) for file_name in file_names]
        
        for file_path in self.__file_paths:
            tasks.append(asyncio.create_task(self.__get_one_site_unique_columns_name(file_path)))
        results = [result for result in await asyncio.gather(*tasks) if result]
        unique_columns = list({item for result in results  for item in result})
        
        # Добавляем колонки для информации о компании и городе
        if 'Компания' not in unique_columns:
            unique_columns.append('Компания')
        if 'Город' not in unique_columns:
            unique_columns.append('Город')
        
        return unique_columns

    
    async def _parsing_one_site(self, 
                                file_path: str) -> Union[None, dict]:
        """
        Парсит 1 сайт(в file_path)
        Args:
            file_path (str): абсолютный путь к файлу

        Returns:
            Union[None, dict]: Если None, то не удалось спарсить сайт. 
                              dict - данные с ключами: 'data' (данные), 'stats' (статистика)
        """
        html = await self.get_file(file_path)
        data = dict()
        stats = {'total_rows': 0, 'filtered_rows': 0}
        
        if not self.__unique_columns_name:
            print("Переменная self.__unique_columns_name не была инициализирована. Инициализирую ее!")
            self.__unique_columns_name = await self.__get_all_unique_columns_name()
        for column_name in self.__unique_columns_name:
            data[column_name] = []

        if self.__checking(html):
            soup = BeautifulSoup(html, 'lxml')
            
            # Извлекаем информацию о компании и городе
            company_info = self.__extract_company_info(soup)
            
            tables = soup.find_all('table', 'tablesorter')

            for table in tables:
                table: BeautifulSoup
                columns_name = [column.text for column in table.find('thead').find_all('th')]
                trS_in_tbody = table.find('tbody').find_all('tr')
                for tr_in_tbody in trS_in_tbody:
                    tdS_in_tbody = tr_in_tbody.find_all('td')
                    stats['total_rows'] += 1
                    
                    # Фильтрация строк по ключевым словам
                    if self.__filter_keywords and not self.__check_row_content(tdS_in_tbody):
                        continue  # Пропускаем эту строку, если она не подходит под фильтр
                    
                    stats['filtered_rows'] += 1
                    
                    for column_name, td_in_tbody in zip(columns_name, tdS_in_tbody):
                        if td_in_tbody.text == '':
                            data[column_name].append(None)
                        else:
                            data[column_name].append(td_in_tbody.text)
                    
                    # Добавляем информацию о компании и городе к каждой строке
                    data['Компания'].append(company_info['company'])
                    data['Город'].append(company_info['city'])
                    
                    for unique_column_name in self.__unique_columns_name:
                        if unique_column_name not in columns_name and unique_column_name not in ['Компания', 'Город']:
                            data[unique_column_name].append(None)
            
            return {'data': data, 'stats': stats}
        
        else:
            return None
        

    def __delete_intermediate_data(self) -> None:
        """
        Удаление ненужных/промежуточных файлов

        Returns:
            None
        """
        for file_path in self.__file_paths:
            os.remove(file_path)


    async def parsing(self, 
                      with_save_result: bool= True) -> pd.DataFrame:
        """
        Парсинг данных из сайтов.
        Args:
            with_save_result (bool, optional): Сохранить ли результат в csv файл?. Defaults to True.

        Returns:
            pd.DataFrame: DataFrame - в котором храниться все спарщенные данные
        """
        # Показываем информацию о фильтрах
        if self.__filter_keywords:
            print(f"🔍 Применяется фильтр: {self.__filter_keywords} (режим: {self.__filter_mode})")
            print("📋 Фильтрация работает на двух уровнях:")
            print("   1. Уровень сайтов - проверяется содержимое всех таблиц")
            print("   2. Уровень строк - проверяется каждая строка в таблицах")
        else:
            print("🔍 Фильтр не установлен - парсятся все сайты и строки")
        
        file_names = os.listdir(self._dir_path)
        self.__file_paths = [os.path.join(self._dir_path, file_name) for file_name in file_names]
        self.__unique_columns_name = await self.__get_all_unique_columns_name()
        data = dict()
        for column_name in self.__unique_columns_name:
            data[column_name] = []

        main_df = pd.DataFrame(data)
        tasks = []
        for file_path in self.__file_paths:
            tasks.append(asyncio.create_task(self._parsing_one_site(file_path)))
        results = await asyncio.gather(*tasks)
        
        sites_without_needing_data= []
        df_s = dict()
        total_rows_all_sites = 0
        filtered_rows_all_sites = 0
        
        for index, result in enumerate(results):
            if not result:
                sites_without_needing_data.append(self.__file_paths[index])
            else:
                try:
                    # Извлекаем данные и статистику
                    site_data = result['data']
                    site_stats = result['stats']
                    
                    total_rows_all_sites += site_stats['total_rows']
                    filtered_rows_all_sites += site_stats['filtered_rows']
                    
                    df_s[self.__file_paths[index]] = pd.DataFrame(data= site_data)
                except ValueError:
                    print("Не все масивы одной длинны тут:", self.__file_paths[index])

        if sites_without_needing_data:
            print("❌ Эти сайты не подходят под шаблон парсинга:", sites_without_needing_data)
        
        if self.__filter_keywords:
            filtered_sites_count = len(sites_without_needing_data)
            total_sites_count = len(self.__file_paths)
            print(f"📊 Статистика фильтрации сайтов: {total_sites_count - filtered_sites_count}/{total_sites_count} сайтов прошли фильтр")
            print(f"📊 Статистика фильтрации строк: {filtered_rows_all_sites}/{total_rows_all_sites} строк прошли фильтр")
        
        if df_s:
            main_df = pd.concat(list(df_s.values()), ignore_index=True)
            main_df = main_df.sort_values(by= 'Наименование', ignore_index=True)
            if with_save_result:
                main_df.to_csv(os.path.join(self._dir_path, 'result.csv'))
                print(f"✅ Сохранено {len(main_df)} записей в result.csv")
        else:
            print("⚠️ Нет данных для сохранения - все сайты отфильтрованы")
            if with_save_result:
                # Создаем пустой файл с заголовками
                empty_df = pd.DataFrame(columns=self.__unique_columns_name)
                empty_df.to_csv(os.path.join(self._dir_path, 'result.csv'))
                print("📄 Создан пустой файл result.csv")
            main_df = pd.DataFrame()
        return main_df
        

    async def run(self,
                  accept: str= '*/*',
                  num: int= 100,
                  start: int= 0,
                  stop: int= 100,
                  with_update_sites_info: bool= False,
                  with_save_result: bool= True,
                  with_remove_intermediate_data: bool= False) -> None:
        """
        Основной метод, после запуска которого выполнятся все необходимые методы в нужной последовательности, а именно:
        1) Сохранение всех данных из html страниц в файлы
        2) Забор нужной информации из этих файлов
        3) При необходимости удаление промежуточных файлов

        Args:
            accept (str, optional): типы файлов, которые клиент может принять (отображается браузером в header-e). Defaults to '*/*'
            with_update_sites_info (bool, optional): Просто обновить все сайты или полностью спарсить и Google-поиск?. Defaults to False.
            num (int, optional): Кол-во сайтов отображаемое Googl-ом на одной ее html странице . Defaults to 100.
            start (int, optional): С какого сайта начать отображать страницы в Google поиске. Defaults to 0.
            stop (int, optional): На каком сайте закончить отображать страницы в Google поиске. Defaults to 100.
            with_save_result (bool, optional): Сохранить результат в файл?. Defaults to True.
            with_remove_intermediate_data (bool, optional): Удалить промежуточные файлы?. Defaults to False.
        
        Returns:
            None
        """
        
        print("Начинаю процесс скачивания данных с сайта")
        await self.save_data(accept= accept,
                             with_update_sites_info= with_update_sites_info,
                             num= num,
                             start= start,
                             stop= stop)
        
        print("Начинаю процесс забора данных со скаченных сайтов")
        await self.parsing(with_save_result= with_save_result)

        if with_remove_intermediate_data:
            print("Удаляю все промежуточные данные")
            self.__delete_intermediate_data()     
