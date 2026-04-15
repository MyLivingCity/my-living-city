FROM node:16

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json /opt/app/
RUN npm install

COPY . /opt/app/

COPY .env /opt/app/.env

ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "start"]
