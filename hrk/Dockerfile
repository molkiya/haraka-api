FROM node:16

WORKDIR /app

USER root

COPY package*.json ./

RUN npm ci --omit=dev && npx haraka -i ./hrk

COPY . .

EXPOSE 3000

CMD ["node", "."]
