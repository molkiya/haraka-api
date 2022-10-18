FROM node:16

WORKDIR /app

USER root

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

CMD ["node", "."]