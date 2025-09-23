# Используем официальный Python образ
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app


# Копируем файлы зависимостей
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY src/ ./src/
COPY parser/ ./parser/
COPY scripts/ ./scripts/

# Делаем скрипт создания админа исполняемым
RUN chmod +x scripts/create_admin.py

# Открываем порт
EXPOSE 8000

# Создаем скрипт запуска с инициализацией админа
RUN echo '#!/bin/bash\n\
echo "Waiting for database to be ready..."\n\
sleep 10\n\
echo "Creating admin user..."\n\
python scripts/create_admin.py\n\
echo "Starting application..."\n\
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000' > /app/start.sh

RUN chmod +x /app/start.sh

# Команда запуска
CMD ["/app/start.sh"]