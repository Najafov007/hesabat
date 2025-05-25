# Сборка React-приложения
FROM node:18 AS build

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы проекта
COPY . .

# Собираем production-бандл
RUN npm run build

# -----------------------------
# Статичный веб-сервер на базе Nginx
FROM nginx:alpine

# Удаляем дефолтную конфигурацию
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранный build из предыдущего этапа
COPY --from=build /app/build /usr/share/nginx/html

# Кастомный Nginx конфиг (если нужно поддерживать client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Порт, на котором будет запущено приложение
EXPOSE 80

# Стартуем nginx
CMD ["nginx", "-g", "daemon off;"]
