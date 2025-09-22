from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, List
from pydantic import BaseModel
import pandas as pd
from .service import ParserService

router = APIRouter(prefix="/parser", tags=["parser"])

parser_service = ParserService()


class ParsingRequest(BaseModel):
    with_proxy: bool = False
    filter_keywords: Optional[List[str]] = None


class ParsingResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    records_count: Optional[int] = None
    data_file: Optional[str] = None
    preview: Optional[List[dict]] = None


@router.post("/run", response_model=ParsingResponse)
async def run_parsing(
    request: ParsingRequest,
    background_tasks: BackgroundTasks
):
    """
    Запускает процесс парсинга данных с сайта 23met.ru
    """
    try:
        result = await parser_service.run_parsing(
            with_proxy=request.with_proxy,
            filter_keywords=request.filter_keywords
        )
        
        return ParsingResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.get("/stats")
def get_parsing_stats():
    """
    Получает статистику по результатам парсинга из последнего CSV файла
    """
    try:
        # Ищем последний файл в папке results
        results_dir = parser_service.parser_path / "results"
        if not results_dir.exists():
            raise HTTPException(status_code=404, detail="Results directory not found")
        
        # Находим последний файл preprocessing_result
        preprocessing_files = list(results_dir.glob("preprocessing_result_*.csv"))
        if not preprocessing_files:
            raise HTTPException(status_code=404, detail="No preprocessing results found")
        
        # Сортируем по времени создания и берем последний
        latest_file = max(preprocessing_files, key=lambda x: x.stat().st_mtime)
        
        csv_result = parser_service.get_csv_data(str(latest_file))
        
        if not csv_result["success"]:
            raise HTTPException(status_code=500, detail=csv_result["error"])
        
        df = csv_result["data"]
        total_records = len(df)
        
        # Статистика по компаниям
        company_stats = []
        if 'Компания' in df.columns and 'Цена' in df.columns:
            company_groups = df.groupby('Компания')['Цена'].agg(['count', 'min', 'max', 'mean']).reset_index()
            
            for _, row in company_groups.iterrows():
                company_stats.append({
                    "company": row['Компания'],
                    "count": int(row['count']),
                    "min_price": float(row['min']) if pd.notna(row['min']) else 0,
                    "max_price": float(row['max']) if pd.notna(row['max']) else 0,
                    "avg_price": float(row['mean']) if pd.notna(row['mean']) else 0
                })
        
        return {
            "success": True,
            "file_name": latest_file.name,
            "file_path": str(latest_file),
            "total_records": total_records,
            "company_stats": company_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats query failed: {str(e)}")


@router.get("/results")
def get_parsing_results_list():
    """
    Получает список всех результатов парсинга
    """
    try:
        results_dir = parser_service.parser_path / "results"
        if not results_dir.exists():
            return {
                "success": True,
                "results": []
            }
        
        # Получаем список всех файлов результатов
        result_files = list(results_dir.glob("result_*.csv"))
        preprocessing_files = list(results_dir.glob("preprocessing_result_*.csv"))
        
        results = []
        for file in sorted(result_files, key=lambda x: x.stat().st_mtime, reverse=True):
            timestamp = file.stem.replace("result_", "")
            preprocessing_file = results_dir / f"preprocessing_result_{timestamp}.csv"
            
            results.append({
                "timestamp": timestamp,
                "result_file": file.name,
                "preprocessing_file": preprocessing_file.name if preprocessing_file.exists() else None,
                "created_at": file.stat().st_mtime,
                "size_bytes": file.stat().st_size
            })
        
        return {
            "success": True,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Results list query failed: {str(e)}")