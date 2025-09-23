from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from .service import CSVDataService
from .models import CSVProductData, CSVResponse, CSVFilterRequest, UniqueNamesResponse, UniqueGostsResponse, UniqueBrandsResponse, ProductJSONResponse, AllValuesFilterRequest, AllValuesResponse, UniqueValuesResponse

router = APIRouter(prefix="/csv-data", tags=["CSV Data"])

# Создаем экземпляр сервиса
csv_service = CSVDataService()


@router.get("/first-product", response_model=CSVProductData)
async def get_first_product(
    name: Optional[str] = Query(None, description="Фильтр по наименованию продукта")
):
    """
    Возвращает первый продукт из CSV файла.
    Если указан параметр name, ищет первый продукт с таким наименованием.
    """
    try:
        product = csv_service.get_first_product_by_name(name)
        if product is None:
            raise HTTPException(status_code=404, detail="Продукт не найден")
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.post("/products", response_model=CSVResponse)
async def get_products_by_filters(filters: CSVFilterRequest):
    """
    Возвращает продукты из CSV файла по заданным фильтрам.
    """
    try:
        return csv_service.get_products_by_filters(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/products", response_model=CSVResponse)
async def get_products(
    name: Optional[str] = Query(None, description="Фильтр по наименованию"),
    gost: Optional[str] = Query(None, description="Фильтр по ГОСТ"),
    brand: Optional[str] = Query(None, description="Фильтр по марке"),
    limit: int = Query(100, description="Количество записей на странице"),
    offset: int = Query(0, description="Смещение для пагинации")
):
    """
    Возвращает продукты из CSV файла по каскадным фильтрам (GET версия).
    Фильтрация: наименование -> ГОСТ -> марка
    """
    try:
        filters = CSVFilterRequest(
            name=name,
            gost=gost,
            brand=brand,
            limit=limit,
            offset=offset
        )
        return csv_service.get_products_by_filters(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/names", response_model=UniqueNamesResponse)
async def get_unique_names():
    """
    Возвращает список всех уникальных наименований для первого уровня фильтрации.
    """
    try:
        return csv_service.get_unique_names()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/gosts", response_model=UniqueGostsResponse)
async def get_unique_gosts(name: str = Query(..., description="Наименование для поиска ГОСТ")):
    """
    Возвращает список уникальных ГОСТ для выбранного наименования (второй уровень фильтрации).
    """
    try:
        return csv_service.get_unique_gosts_by_name(name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/brands", response_model=UniqueBrandsResponse)
async def get_unique_brands(
    name: str = Query(..., description="Наименование"),
    gost: str = Query(..., description="ГОСТ для поиска марок")
):
    """
    Возвращает список уникальных марок для выбранного ГОСТ (третий уровень фильтрации).
    """
    try:
        return csv_service.get_unique_brands_by_gost(name, gost)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/products-json", response_model=ProductJSONResponse)
async def get_products_json(
    name: Optional[str] = Query(None, description="Фильтр по наименованию"),
    gost: Optional[str] = Query(None, description="Фильтр по ГОСТ"),
    brand: Optional[str] = Query(None, description="Фильтр по марке"),
    limit: int = Query(100, description="Количество записей на странице"),
    offset: int = Query(0, description="Смещение для пагинации")
):
    """
    Возвращает продукты в требуемом JSON формате с полями:
    - вид продукции, склад, наименование, марка стали, диаметр, ГОСТ, цена, наличие, производитель, регион
    """
    try:
        filters = CSVFilterRequest(
            name=name,
            gost=gost,
            brand=brand,
            limit=limit,
            offset=offset
        )
        return csv_service.get_products_json_response(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.post("/products-json", response_model=ProductJSONResponse)
async def get_products_json_post(filters: CSVFilterRequest):
    """
    Возвращает продукты в требуемом JSON формате (POST версия).
    """
    try:
        return csv_service.get_products_json_response(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/all-values", response_model=AllValuesResponse)
async def get_all_unique_values(
    вид_продукции: Optional[str] = Query(None, description="Фильтр по виду продукции"),
    склад: Optional[str] = Query(None, description="Фильтр по складу (городу)"),
    наименование: Optional[str] = Query(None, description="Фильтр по наименованию"),
    марка: Optional[str] = Query(None, description="Фильтр по марке"),
    диаметр: Optional[str] = Query(None, description="Фильтр по диаметру"),
    гост: Optional[str] = Query(None, description="Фильтр по ГОСТ")
):
    """
    Возвращает все уникальные значения для всех полей с каскадной фильтрацией.
    Если фильтры не указаны, возвращает все значения.
    Каскадная фильтрация: вид_продукции -> склад -> наименование -> марка -> диаметр -> гост
    """
    try:
        filters = AllValuesFilterRequest(
            вид_продукции=вид_продукции,
            склад=склад,
            наименование=наименование,
            марка=марка,
            диаметр=диаметр,
            гост=гост
        )
        return csv_service.get_all_unique_values(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.post("/all-values", response_model=AllValuesResponse)
async def get_all_unique_values_post(filters: AllValuesFilterRequest):
    """
    Возвращает все уникальные значения для всех полей с каскадной фильтрацией (POST версия).
    """
    try:
        return csv_service.get_all_unique_values(filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.get("/unique-values/{field}", response_model=UniqueValuesResponse)
async def get_unique_values_by_field(
    field: str,
    вид_продукции: Optional[str] = Query(None, description="Фильтр по виду продукции"),
    склад: Optional[str] = Query(None, description="Фильтр по складу (городу)"),
    наименование: Optional[str] = Query(None, description="Фильтр по наименованию"),
    марка: Optional[str] = Query(None, description="Фильтр по марке"),
    диаметр: Optional[str] = Query(None, description="Фильтр по диаметру"),
    гост: Optional[str] = Query(None, description="Фильтр по ГОСТ")
):
    """
    Возвращает уникальные значения для конкретного поля с каскадной фильтрацией.
    Доступные поля: вид_продукции, склад, наименование, марка, диаметр, гост
    """
    try:
        filters = AllValuesFilterRequest(
            вид_продукции=вид_продукции,
            склад=склад,
            наименование=наименование,
            марка=марка,
            диаметр=диаметр,
            гост=гост
        )
        return csv_service.get_unique_values_by_field(field, filters)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.post("/unique-values/{field}", response_model=UniqueValuesResponse)
async def get_unique_values_by_field_post(field: str, filters: AllValuesFilterRequest):
    """
    Возвращает уникальные значения для конкретного поля с каскадной фильтрацией (POST версия).
    """
    try:
        return csv_service.get_unique_values_by_field(field, filters)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных: {str(e)}")


@router.post("/refresh")
async def refresh_csv_data():
    """
    Обновляет данные, загружая последний доступный CSV файл из папки results.
    """
    try:
        csv_service.refresh_data()
        return {"message": "Данные успешно обновлены", "file_path": csv_service.csv_file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления данных: {str(e)}")


@router.get("/current-file")
async def get_current_csv_file():
    """
    Возвращает путь к текущему используемому CSV файлу.
    """
    try:
        return {"file_path": csv_service.csv_file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения информации о файле: {str(e)}")