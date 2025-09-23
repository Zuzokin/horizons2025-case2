import pandas as pd
import os
import glob
from typing import Any, Dict, List, Optional
from datetime import datetime
from pathlib import Path
from .models import CSVProductData, CSVFilterRequest, CSVResponse, UniqueNamesResponse, UniqueGostsResponse, UniqueBrandsResponse, ProductRecord, ProductJSONResponse, AllValuesFilterRequest, AllValuesResponse, UniqueValuesResponse


class CSVDataService:
    """Сервис для работы с данными из CSV файла"""
    
    def __init__(self):
        self.csv_file_path = self._get_latest_csv_file()
        self._data: Optional[pd.DataFrame] = None
    
    def _get_latest_csv_file(self) -> str:
        """Находит последний сгенерированный CSV файл в папке results"""
        # Путь к папке results
        parser_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'parser')
        results_dir = os.path.join(parser_dir, 'results')
        
        # Если папка results не существует, используем старый путь
        if not os.path.exists(results_dir):
            old_path = os.path.join(parser_dir, 'preprocessing_result.csv')
            if os.path.exists(old_path):
                return old_path
            else:
                raise FileNotFoundError("No CSV files found in parser directory")
        
        # Ищем все файлы preprocessing_result_*.csv в папке results
        pattern = os.path.join(results_dir, 'preprocessing_result_*.csv')
        csv_files = glob.glob(pattern)
        
        if not csv_files:
            # Если нет файлов с timestamp, ищем обычный preprocessing_result.csv
            fallback_path = os.path.join(results_dir, 'preprocessing_result.csv')
            if os.path.exists(fallback_path):
                return fallback_path
            
            # Если и его нет, используем старый путь
            old_path = os.path.join(parser_dir, 'preprocessing_result.csv')
            if os.path.exists(old_path):
                return old_path
            
            raise FileNotFoundError("No preprocessing CSV files found")
        
        # Сортируем файлы по времени модификации (последний измененный файл)
        latest_file = max(csv_files, key=os.path.getmtime)
        return latest_file
    
    def _load_data(self) -> pd.DataFrame:
        """Загружает данные из CSV файла"""
        if self._data is None:
            try:
                self._data = pd.read_csv(self.csv_file_path)
                # Заменяем NaN значения на None для корректной работы с JSON
                self._data = self._data.where(pd.notnull(self._data), None)
            except Exception as e:
                raise Exception(f"Ошибка загрузки CSV файла: {str(e)}")
        return self._data
    
    def refresh_data(self) -> None:
        """Обновляет данные, загружая последний доступный CSV файл"""
        self.csv_file_path = self._get_latest_csv_file()
        self._data = None  # Сбрасываем кэш данных
        self._load_data()  # Загружаем новые данные
    
    def get_first_product_by_name(self, name: Optional[str] = None) -> Optional[CSVProductData]:
        """Возвращает первый продукт по наименованию"""
        data = self._load_data()
        
        if name:
            # Фильтруем по наименованию (регистронезависимый поиск)
            filtered_data = data[data['Наименование'].str.contains(name, case=False, na=False)]
        else:
            # Если имя не указано, берем первый продукт
            filtered_data = data
        
        if filtered_data.empty:
            return None
        
        # Берем первую строку
        first_row = filtered_data.iloc[0]
        
        return self._row_to_model(first_row)
    
    def get_products_by_filters(self, filters: CSVFilterRequest) -> CSVResponse:
        """Возвращает продукты по каскадным фильтрам"""
        data = self._load_data()
        filtered_data = data.copy()
        
        # Каскадная фильтрация
        if filters.name:
            filtered_data = filtered_data[filtered_data['Наименование'].str.contains(filters.name, case=False, na=False)]
        
        if filters.gost:
            filtered_data = filtered_data[filtered_data['ГОСТ'].str.contains(filters.gost, case=False, na=False)]
        
        if filters.brand:
            filtered_data = filtered_data[filtered_data['Основная_марка'].str.contains(filters.brand, case=False, na=False)]
        
        total_count = len(filtered_data)
        
        # Применяем пагинацию
        start_idx = filters.offset
        end_idx = start_idx + filters.limit
        paginated_data = filtered_data.iloc[start_idx:end_idx]
        
        # Конвертируем в модели
        products = [self._row_to_model(row) for _, row in paginated_data.iterrows()]
        
        return CSVResponse(
            data=products,
            total=total_count,
            limit=filters.limit,
            offset=filters.offset
        )
    
    def _row_to_model(self, row: pd.Series) -> CSVProductData:
        """Конвертирует строку DataFrame в модель CSVProductData"""
        def safe_get(key, default=None):
            value = row.get(key, default)
            # Преобразуем NaN в None для корректной работы с Pydantic
            if pd.isna(value):
                return None
            return value
        
        def safe_get_str(key, default=None):
            value = safe_get(key, default)
            return str(value) if value is not None else None
        
        def safe_get_int(key, default=None):
            value = safe_get(key, default)
            return int(value) if value is not None and not pd.isna(value) else None
        
        def safe_get_float(key, default=None):
            value = safe_get(key, default)
            return float(value) if value is not None and not pd.isna(value) else None
        
        def safe_get_bool(key, default=None):
            value = safe_get(key, default)
            if value is None or pd.isna(value):
                return None
            return bool(value)
        
        return CSVProductData(
            id=safe_get_int('Unnamed: 0'),
            gost=safe_get_str('ГОСТ'),
            name=safe_get_str('Наименование'),
            thickness=safe_get_float('Толщина'),
            size=safe_get_str('Размер'),
            brand=safe_get_str('Основная_марка'),
            material_type=safe_get_str('Тип_материала'),
            price_category=safe_get_str('Категория_цены'),
            price=safe_get_float('Цена')
        )
    
    def get_unique_names(self) -> UniqueNamesResponse:
        """Возвращает список уникальных наименований, содержащих 'Труба э/с', 'Труба б/ш' или 'г/д'"""
        data = self._load_data()
        # Фильтруем только нужные наименования
        filtered_data = data[
            (data['Наименование'].str.fullmatch('Труба э/с', case=False, na=False)) |
            (data['Наименование'].str.fullmatch('Труба ВГП', case=False, na=False)) |
            (data['Наименование'].str.fullmatch('Труба б/ш г/д', case=False, na=False))]
        unique_names = filtered_data['Наименование'].dropna().unique().tolist()
        # Сортируем по алфавиту
        unique_names.sort()
        return UniqueNamesResponse(names=unique_names)
    
    def get_unique_gosts_by_name(self, name: str) -> UniqueGostsResponse:
        """Возвращает список уникальных ГОСТ для выбранного наименования"""
        data = self._load_data()
        filtered_data = data[data['Наименование'].str.fullmatch(name, case=False, na=False)]
        
        # Список разрешенных ГОСТ
        allowed_gosts = [
            "ГОСТ 3262-75",
            "ГОСТ 10705-80",
            "ГОСТ 10704-91 ГОСТ 10705-80",
            "ГОСТ 10705-80 ГОСТ 10706-76",
            "ГОСТ 10705-80 ГОСТ 20295-85",
            "ГОСТ 30245-2003",
            "ГОСТ 30245-94",
            "ГОСТ 8639-82 ГОСТ 13663-86 ГОСТ 30245-2003",
            "ГОСТ 8639-82 ГОСТ 30245-2003",
            "ГОСТ 8645-68 ГОСТ 13663-86 ГОСТ 30245-2003",
            "ГОСТ 8645-68 ГОСТ 30245-2003",
            "ГОСТ 13663-86",
            "ГОСТ 8639-82 ГОСТ 13663-86",
            "ГОСТ 8645-68 ГОСТ 13663-86",
            "ГОСТ 10704-91 ГОСТ 10706-76",
            "ГОСТ 10705-80 ГОСТ 10706-76",
            "ГОСТ 10706-76",
            "ГОСТ 10706-76 ТС 153-11-2002-05-2015",
            "ГОСТ 10706-76 ТУ 14-156-107-2015",
            "ГОСТ 8731-74 ГОСТ 8732-78",
            "ГОСТ 8732-78",
            "ГОСТ 8732-78 ТУ 14-158-113-99",

        ]
        
        # Фильтруем только разрешенные ГОСТ
        gost_filter = filtered_data['ГОСТ'].isin(allowed_gosts)
        filtered_data = filtered_data[gost_filter]
        
        unique_gosts = filtered_data['ГОСТ'].dropna().unique().tolist()
        # Сортируем по алфавиту
        unique_gosts.sort()
        return UniqueGostsResponse(gosts=unique_gosts)
    
    def get_unique_brands_by_gost(self, name: str, gost: str) -> UniqueBrandsResponse:
        """Возвращает список уникальных марок для выбранного ГОСТ"""
        data = self._load_data()
        filtered_data = data[
            (data['Наименование'].str.fullmatch(name, case=False, na=False)) &
            (data['ГОСТ'].str.contains(gost, case=False, na=False))
        ]
        
        # Список разрешенных марок
        allowed_brands = ["20", "09Г2С", "17Г1С"]
        
        # Фильтруем только разрешенные марки из столбца Основная_марка
        brand_filter = filtered_data['Основная_марка'].isin(allowed_brands)
        filtered_data = filtered_data[brand_filter]
        
        unique_brands = filtered_data['Основная_марка'].dropna().unique().tolist()
        # Сортируем по алфавиту
        unique_brands.sort()
        return UniqueBrandsResponse(brands=unique_brands)
    
    def _get_region_by_city(self, city: Optional[str]) -> Optional[str]:
        """Определяет регион по городу"""
        if not city:
            return None
            
        city_lower = city.lower().strip()
        
        # СЗФО: Череповец
        if city_lower in ['череповец']:
            return 'СЗФО'
        
        # СФО: Абакан, Барнаул, Кемерово, Иркутск
        elif city_lower in ['абакан', 'барнаул', 'кемерово', 'иркутск']:
            return 'СФО'
        
        # ЦФО: Москва, Белгород
        elif city_lower in ['москва', 'белгород']:
            return 'ЦФО'
        
        # ДФО: Благовещенск, Владивосток
        elif city_lower in ['благовещенск', 'владивосток']:
            return 'ДФО'
        
        # ПФО: Казань, Ижевск
        elif city_lower in ['казань', 'ижевск']:
            return 'ПФО'
        
        # ЮФО: Краснодар, Волгоград
        elif city_lower in ['краснодар', 'волгоград']:
            return 'ЮФО'
        
        # УрФО: Екатеринбург, Курган
        elif city_lower in ['екатеринбург', 'курган']:
            return 'УрФО'
        
        return None
    
    def get_products_json_response(self, filters: CSVFilterRequest) -> ProductJSONResponse:
        """Возвращает продукты в требуемом JSON формате"""
        data = self._load_data()
        filtered_data = data.copy()
        
        # Сначала фильтруем только трубы с нужными наименованиями
        tube_mask = filtered_data['Наименование'].apply(
            lambda name: self._is_valid_tube_product(str(name) if not pd.isna(name) else "")
        )
        filtered_data = filtered_data[tube_mask]
        
        # Затем применяем каскадную фильтрацию
        if filters.name:
            filtered_data = filtered_data[filtered_data['Наименование'].str.contains(filters.name, case=False, na=False)]
        
        if filters.gost:
            filtered_data = filtered_data[filtered_data['ГОСТ'].str.contains(filters.gost, case=False, na=False)]
        
        if filters.brand:
            filtered_data = filtered_data[filtered_data['Основная_марка'].str.contains(filters.brand, case=False, na=False)]
        
        total_count = len(filtered_data)
        
        # Применяем пагинацию
        start_idx = filters.offset
        end_idx = start_idx + filters.limit
        paginated_data = filtered_data.iloc[start_idx:end_idx]
        
        # Конвертируем в записи продукта
        records = []
        for _, row in paginated_data.iterrows():
            record = self._row_to_product_record(row)
            records.append(record)
        
        return ProductJSONResponse(
            success=True,
            generated_at=datetime.utcnow().isoformat() + "Z",
            currency="RUB",
            price_unit="руб/т",
            total_count=total_count,
            limit=filters.limit,
            offset=filters.offset,
            records=records
        )
    
    def _determine_product_type(self, name: str) -> str:
        """Определяет вид продукции на основе наименования"""
        if not name:
            return "Неизвестно"
        
        name_lower = name.lower()
        
        # Если наименование содержит "Труба б/ш г/д", то вид продукции "Труба б/ш г/д"
        if "труба б/ш г/д" in name_lower:
            return "Труба б/ш г/д"
        
        # Если наименование содержит "Труба ВГП", "Труба э/с магистральная", "Труба э/с", то вид продукции "Э/С"
        if any(keyword in name_lower for keyword in ["труба вгп", "труба э/с магистральная", "труба э/с"]):
            return "Э/С"
        
        # По умолчанию возвращаем исходное значение или "Неизвестно"
        return "Неизвестно"
    
    def _is_valid_tube_product(self, name: str) -> bool:
        """Проверяет, является ли продукт трубой с нужным наименованием"""
        if not name:
            return False
        
        name_lower = name.lower()
        
        # Проверяем, содержит ли наименование нужные ключевые слова
        valid_keywords = [
            "труба б/ш г/д",
            "труба вгп", 
            "труба э/с магистральная",
            "труба э/с"
        ]
        
        return any(keyword in name_lower for keyword in valid_keywords)

    def _row_to_product_record(self, row: pd.Series) -> ProductRecord:
        """Конвертирует строку DataFrame в ProductRecord"""
        def safe_get(key, default=None):
            value = row.get(key, default)
            if pd.isna(value):
                return None
            return value
        
        def safe_get_str(key, default=None):
            value = safe_get(key, default)
            return str(value) if value is not None else None
        
        def safe_get_float(key, default=None):
            value = safe_get(key, default)
            return float(value) if value is not None and not pd.isna(value) else None
        
        # Получаем город из данных (предполагаем, что есть поле с городом)
        # Если в CSV нет поля с городом, используем значение по умолчанию
        city = safe_get_str('Город', '-')  # По умолчанию Москва
        region = self._get_region_by_city(city)
        
        # Получаем производителя (компанию) - если нет поля, используем значение по умолчанию
        producer = safe_get_str('Компания', '-')
        
        # Формируем информацию о наличии
        availability = "в наличии (50 т)"  # По умолчанию
        
        steel_grade = safe_get_str('Основная_марка')
        
        # Получаем наименование для определения вида продукции
        name = safe_get_str('Наименование')
        product_type = self._determine_product_type(name)
        
        return ProductRecord(
            вид_продукции=product_type,
            склад=city,
            наименование=name,
            марка_стали=steel_grade,
            диаметр=safe_get_str('Размер'),
            ГОСТ=safe_get_str('ГОСТ'),
            цена=safe_get_float('Цена'),
            наличие=availability,
            производитель=producer,
            регион=region
        )
    
    def _filter_by_product_type(self, data: pd.DataFrame, product_type_filter: str) -> pd.DataFrame:
        """Фильтрует данные по виду продукции с учетом новой логики определения"""
        if not product_type_filter:
            return data
        
        # Создаем маску для фильтрации
        mask = data['Наименование'].apply(
            lambda name: self._determine_product_type(str(name) if name else "") == product_type_filter
        )
        return data[mask]

    def get_all_unique_values(self, filters: AllValuesFilterRequest) -> AllValuesResponse:
        """Возвращает все уникальные значения с каскадной фильтрацией"""
        data = self._load_data()
        filtered_data = data.copy()
        
        # Сначала фильтруем только трубы с нужными наименованиями
        tube_mask = filtered_data['Наименование'].apply(
            lambda name: self._is_valid_tube_product(str(name) if not pd.isna(name) else "")
        )
        filtered_data = filtered_data[tube_mask]
        
        # Применяем каскадную фильтрацию
        if filters.вид_продукции:
            filtered_data = self._filter_by_product_type(filtered_data, filters.вид_продукции)
        
        if filters.склад:
            filtered_data = filtered_data[filtered_data['Город'].str.contains(filters.склад, case=False, na=False)]
        
        if filters.наименование:
            filtered_data = filtered_data[filtered_data['Наименование'].str.contains(filters.наименование, case=False, na=False)]
        
        if filters.марка:
            filtered_data = filtered_data[filtered_data['Основная_марка'].str.contains(filters.марка, case=False, na=False)]
        
        if filters.диаметр:
            filtered_data = filtered_data[filtered_data['Размер'].str.contains(filters.диаметр, case=False, na=False)]
        
        if filters.гост:
            filtered_data = filtered_data[filtered_data['ГОСТ'].str.contains(filters.гост, case=False, na=False)]
        
        # Получаем уникальные значения для каждого поля
        def get_unique_values(column_name: str) -> list[str]:
            values = filtered_data[column_name].dropna().unique().tolist()
            # Преобразуем в строки и убираем пустые значения
            values = [str(v).strip() for v in values if str(v).strip() and str(v).strip() != 'nan']
            values.sort()
            return values
        
        # Для вида продукции используем новую логику определения
        def get_unique_product_types() -> list[str]:
            product_types = set()
            for _, row in filtered_data.iterrows():
                name = str(row.get('Наименование', '')) if not pd.isna(row.get('Наименование')) else ''
                product_type = self._determine_product_type(name)
                if product_type and product_type != "Неизвестно":
                    product_types.add(product_type)
            return sorted(list(product_types))
        
        return AllValuesResponse(
            вид_продукции=get_unique_product_types(),
            склад=get_unique_values('Город'),
            наименование=get_unique_values('Наименование'),
            марка=get_unique_values('Основная_марка'),
            диаметр=get_unique_values('Размер'),
            гост=get_unique_values('ГОСТ')
        )
    
    def get_unique_values_by_field(self, field: str, filters: AllValuesFilterRequest) -> UniqueValuesResponse:
        """Возвращает уникальные значения для конкретного поля с каскадной фильтрацией"""
        data = self._load_data()
        filtered_data = data.copy()
        
        # Сначала фильтруем только трубы с нужными наименованиями
        tube_mask = filtered_data['Наименование'].apply(
            lambda name: self._is_valid_tube_product(str(name) if not pd.isna(name) else "")
        )
        filtered_data = filtered_data[tube_mask]
        
        # Применяем каскадную фильтрацию
        if filters.вид_продукции:
            filtered_data = self._filter_by_product_type(filtered_data, filters.вид_продукции)
        
        if filters.склад:
            filtered_data = filtered_data[filtered_data['Город'].str.contains(filters.склад, case=False, na=False)]
        
        if filters.наименование:
            filtered_data = filtered_data[filtered_data['Наименование'].str.contains(filters.наименование, case=False, na=False)]
        
        if filters.марка:
            filtered_data = filtered_data[filtered_data['Основная_марка'].str.contains(filters.марка, case=False, na=False)]
        
        if filters.диаметр:
            filtered_data = filtered_data[filtered_data['Размер'].str.contains(filters.диаметр, case=False, na=False)]
        
        if filters.гост:
            filtered_data = filtered_data[filtered_data['ГОСТ'].str.contains(filters.гост, case=False, na=False)]
        
        # Маппинг полей на колонки CSV
        field_mapping = {
            'вид_продукции': 'Тип_продукции',
            'склад': 'Город',
            'наименование': 'Наименование',
            'марка': 'Основная_марка',
            'диаметр': 'Размер',
            'гост': 'ГОСТ'
        }
        
        if field not in field_mapping:
            raise ValueError(f"Неизвестное поле: {field}")
        
        # Специальная обработка для поля "вид_продукции"
        if field == 'вид_продукции':
            product_types = set()
            for _, row in filtered_data.iterrows():
                name = str(row.get('Наименование', '')) if not pd.isna(row.get('Наименование')) else ''
                product_type = self._determine_product_type(name)
                if product_type and product_type != "Неизвестно":
                    product_types.add(product_type)
            values = sorted(list(product_types))
        else:
            column_name = field_mapping[field]
            values = filtered_data[column_name].dropna().unique().tolist()
            # Преобразуем в строки и убираем пустые значения
            values = [str(v).strip() for v in values if str(v).strip() and str(v).strip() != 'nan']
            values.sort()
        
        return UniqueValuesResponse(values=values, field=field)
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Возвращает все продукты в виде списка словарей для алгоритма ценообразования"""
        data = self._load_data()
        products = []
        
        for _, row in data.iterrows():
            name = str(row.get('Наименование', '')) if not pd.isna(row.get('Наименование')) else ''
            product_dict = {
                "вид_продукции": self._determine_product_type(name),
                "склад": str(row.get('Город', '')),
                "наименование": name,
                "марка_стали": str(row.get('Основная_марка', '')),
                "диаметр": str(row.get('Размер', '')),
                "ГОСТ": str(row.get('ГОСТ', '')),
                "цена": float(row.get('Цена', 0)) if not pd.isna(row.get('Цена')) else 0.0,
                "производитель": str(row.get('Компания', '')),
                "регион": self._get_region_by_city(str(row.get('Город', '')))
            }
            products.append(product_dict)
        
        return products


# Глобальный экземпляр сервиса
csv_data_service = CSVDataService()