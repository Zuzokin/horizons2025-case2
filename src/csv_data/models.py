from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class CSVProductData(BaseModel):
    """Модель для данных продукта из CSV файла"""
    id: Optional[int] = None
    gost: Optional[str] = None # ГОСТ
    name: Optional[str] = None  # Наименование
    thickness: Optional[float] = None  # Толщина
    size: Optional[str] = None  # Размер
    brand: Optional[str] = None  # Марка
    material_type: Optional[str] = None  # Тип_материала 
    price_category: Optional[str] = None  # Категория_цены
    price: Optional[float] = None  # Цена

    model_config = ConfigDict(from_attributes=True)


class CSVFilterRequest(BaseModel):
    """Модель для фильтров запроса - каскадная фильтрация"""
    name: Optional[str] = None  # Первый уровень фильтрации
    gost: Optional[str] = None  # Второй уровень фильтрации (после выбора наименования)
    brand: Optional[str] = None  # Третий уровень фильтрации (после выбора ГОСТ)
    limit: Optional[int] = 100
    offset: Optional[int] = 0


class CSVResponse(BaseModel):
    """Модель ответа с данными из CSV"""
    data: list[CSVProductData]
    total: int
    limit: int
    offset: int


class UniqueNamesResponse(BaseModel):
    """Модель ответа с уникальными наименованиями"""
    names: list[str]


class UniqueGostsResponse(BaseModel):
    """Модель ответа с уникальными ГОСТ для выбранного наименования"""
    gosts: list[str]


class UniqueBrandsResponse(BaseModel):
    """Модель ответа с уникальными марками для выбранного ГОСТ"""
    brands: list[str]


class ProductRecord(BaseModel):
    """Модель записи продукта в требуемом формате"""
    вид_продукции: Optional[str] = None
    склад: Optional[str] = None
    наименование: Optional[str] = None
    марка_стали: Optional[str] = None
    диаметр: Optional[str] = None
    ГОСТ: Optional[str] = None
    цена: Optional[float] = None
    наличие: Optional[str] = None
    производитель: Optional[str] = None
    регион: Optional[str] = None


class ProductJSONResponse(BaseModel):
    """Модель JSON ответа в требуемом формате"""
    success: bool = True
    generated_at: str
    currency: str = "RUB"
    price_unit: str = "руб/т"
    total_count: int
    limit: int
    offset: int
    records: list[ProductRecord]


class AllValuesFilterRequest(BaseModel):
    """Модель для фильтров получения всех значений - каскадная фильтрация"""
    вид_продукции: Optional[str] = None  # Первый уровень фильтрации
    склад: Optional[str] = None  # Второй уровень фильтрации (после выбора вида продукции)
    наименование: Optional[str] = None  # Третий уровень фильтрации (после выбора склада)
    марка: Optional[str] = None  # Четвертый уровень фильтрации (после выбора наименования)
    диаметр: Optional[str] = None  # Пятый уровень фильтрации (после выбора марки)
    гост: Optional[str] = None  # Шестой уровень фильтрации (после выбора диаметра)


class AllValuesResponse(BaseModel):
    """Модель ответа со всеми уникальными значениями"""
    вид_продукции: list[str]
    склад: list[str]
    наименование: list[str]
    марка: list[str]
    диаметр: list[str]
    гост: list[str]


class UniqueValuesResponse(BaseModel):
    """Модель ответа с уникальными значениями для конкретного поля"""
    values: list[str]
    field: str