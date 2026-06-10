FROM node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install bcryptjs --save
COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache \
    ffmpeg \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.sequelizerc ./
COPY --from=builder /app/database.config.js ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
