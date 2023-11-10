FROM NODE:18 as Base

FROM Base as Development

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD [ "npm,run,start:dev" ]

