FROM node:16-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD [ "NPM", "RUN", "serve" ]
