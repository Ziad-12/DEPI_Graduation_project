FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .
RUN mkdir -p /app/data && chown -R node:node /app

USER node

ENV DB_PATH=/app/data/database.sqlite
ENV NODE_ENV=production

EXPOSE 8000

CMD ["npm", "start"]
