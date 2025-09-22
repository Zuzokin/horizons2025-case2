# Frontend - Horizons Case 2

React приложение с TypeScript для анализа металлического рынка.

## 🚀 Возможности

- **Современный интерфейс** с Material-UI
- **Аналитика цен** и графики с Recharts
- **Мониторинг конкурентов**
- **Поиск клиентов**
- **Уведомления** о изменениях цен
- **Адаптивный дизайн**

## 📋 Требования

- Node.js 18+
- npm или yarn

## 🛠️ Установка и запуск

### Локальная разработка
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build

# Запуск тестов
npm test
```

### Docker
```bash
# Сборка образа
docker build -t horizons-frontend .

# Запуск контейнера
docker run -p 3000:3000 horizons-frontend
```

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── components/        # React компоненты
│   ├── contexts/          # React контексты
│   ├── data/             # Данные и типы
│   ├── utils/            # Утилиты
│   ├── App.tsx           # Главный компонент
│   └── index.tsx         # Точка входа
├── public/               # Статические файлы
├── package.json          # Зависимости
├── tsconfig.json         # TypeScript конфигурация
├── Dockerfile            # Docker конфигурация
└── nginx.conf            # Nginx конфигурация
```

## 🔧 Технологии

- **React 19** - UI библиотека
- **TypeScript** - Типизация
- **Material-UI** - UI компоненты
- **Recharts** - Графики и диаграммы
- **Axios** - HTTP клиент

## 🌐 API интеграция

Фронтенд настроен для работы с бэкендом:
- API запросы проксируются через nginx (`/api/*` → `app:8000`)
- CORS настроен автоматически
- Health check доступен на `/health`

## 📱 Компоненты

### Основные компоненты
- `AuthPage` - Страница аутентификации
- `MainAnalytics` - Главная аналитика
- `PriceMonitoringDashboard` - Мониторинг цен
- `CompetitorMonitoring` - Мониторинг конкурентов
- `ClientSearch` - Поиск клиентов

### Утилиты
- `api.ts` - API клиент
- `AuthContext.tsx` - Контекст аутентификации

## 🔒 Аутентификация

Приложение использует JWT токены для аутентификации:
- Регистрация новых пользователей
- Вход в систему
- Защищенные маршруты
- Автоматическое обновление токенов

## 📊 Данные

### Источники данных
- CSV файлы с данными парсинга
- API endpoints для получения данных
- Локальное кэширование

### Типы данных
- Металлические изделия
- Цены и аналитика
- Конкурентная информация
- Клиентские данные

## 🎨 Стилизация

- **Material-UI** для базовых компонентов
- **Кастомные CSS** для специфичных стилей
- **Адаптивный дизайн** для всех устройств
- **Темная/светлая тема** (планируется)

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e
```

## 🚀 Развертывание

### Development
```bash
npm start
```

### Production
```bash
npm run build
# Файлы в папке build/ готовы для развертывания
```

### Docker
```bash
docker build -t horizons-frontend .
docker run -p 3000:3000 horizons-frontend
```

## 🔧 Переменные окружения

Создайте файл `.env` в папке frontend:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## 📚 Документация

- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Recharts Documentation](https://recharts.org/)

## 🤝 Вклад в проект

1. Создайте feature branch
2. Внесите изменения
3. Добавьте тесты
4. Создайте Pull Request

---

**Frontend** - Современный веб-интерфейс для анализа металлического рынка 🎨