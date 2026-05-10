FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production \
    TRANSFORMERS_CACHE=/app/.cache/transformers

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

RUN mkdir -p /app/.cache/transformers && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
