# backend/Dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y curl


WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Изменяем владельца файлов
RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["npm", "start"]