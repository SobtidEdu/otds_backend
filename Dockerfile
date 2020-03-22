FROM node:12.4.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

COPY package.json /usr/src/app/
RUN yarn install

RUN apt-get update
RUN apt-get install -y tzdata

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 3000

CMD [ "yarn", "start:dev"]