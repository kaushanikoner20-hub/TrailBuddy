# Minimal image for the TrailBuddy app. Ollama and Gemma run OUTSIDE this container.
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/index.js"]