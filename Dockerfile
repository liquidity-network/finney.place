FROM node:9.11.2

USER root
WORKDIR /code
VOLUME /var/log/place

RUN apt-get update \
	&& apt-get install -y git build-essential python

EXPOSE 3000

CMD bash -c "yarn install && node app.js"
