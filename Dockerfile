# Stage 1: Build React + Vite Frontend
FROM node:22-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production Express + Socket.io Server
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src/ ./src/
COPY public/ ./public/
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "server.js"]
