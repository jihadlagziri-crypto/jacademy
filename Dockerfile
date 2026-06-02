FROM node:18-slim
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY . .
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/server.js"]
