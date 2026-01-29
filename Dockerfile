FROM node:20-alpine

# 1. Ishchi papkani yaratamiz
WORKDIR /app

# 2. Kutubxonalarni o'rnatamiz
COPY package*.json ./
RUN npm install

# 3. Loyiha kodini nusxalaymiz
COPY . .

# 4. TypeScript kodini JavaScript-ga o'giramiz (Build)
RUN npm run build

# dist papkasi haqiqatda borligini tekshirish uchun (logda ko'rinadi)
RUN ls -la dist/

CMD ["node", "dist/src/main.js"]
