FROM node:current-alpine3.17

WORKDIR /home/cycclon/Projects/rioja-recursos/backend/centros

COPY . /home/cycclon/Projects/rioja-recursos/backend/centros

RUN npm install

EXPOSE 3002

CMD npm run Start