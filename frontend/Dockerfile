# Multi-stage build для фронтенда
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage с nginx
FROM nginx:alpine

# Устанавливаем wget для health check
RUN apk add --no-cache wget

# Удаляем дефолтную конфигурацию nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем билд из builder stage
COPY --from=builder /app/build/ /usr/share/nginx/html/

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Устанавливаем права доступа
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Открываем порт
EXPOSE 3000

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
