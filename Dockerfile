FROM node:12.4.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# COPY package.json /usr/src/app/
RUN yarn install

EXPOSE 3000

CMD [ "yarn", "run", "start:dev"]