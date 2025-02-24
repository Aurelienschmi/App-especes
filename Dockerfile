FROM node:23-alpine3.20

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY src ./src
COPY public ./public
COPY tests .

RUN npm run test

ENV PORT=3000

EXPOSE 3000


ENTRYPOINT [ "npm" ]
CMD ["run", "build"]