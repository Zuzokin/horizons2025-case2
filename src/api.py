from fastapi import FastAPI
from src.auth.controller import router as auth_router
from src.users.controller import router as users_router
from src.csv_data.controller import router as csv_data_router
from src.parser.controller import router as parser_router
from src.pricing.controller import router as pricing_router

def register_routes(app: FastAPI):
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(csv_data_router)
    app.include_router(parser_router)
    app.include_router(pricing_router)