# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Этап продакшен-сервера
FROM nginx:stable-alpine

# Удалим стандартную страницу nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранный билд
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомный nginx конфиг (опционально)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
