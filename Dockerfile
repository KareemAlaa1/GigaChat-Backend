FROM node:18 as base

FROM base as development

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD [ "npm","run","start:dev" ]

