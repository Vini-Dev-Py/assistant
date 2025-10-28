# Use Node 18 (ok para Prisma). Se outro pacote exigir 20+, troque aqui.
FROM node:18

WORKDIR /app

# Copia só o que precisa para instalar deps mais cedo (cache melhor)
COPY package*.json ./
RUN npm install

# Copia o restante do código (inclui prisma/)
COPY . .

# Build do TypeScript
RUN npm run build

EXPOSE 3000

# Não rode a app aqui; o compose vai sobrepor com command
CMD ["node", "dist/index.js"]
