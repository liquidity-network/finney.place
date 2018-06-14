FROM node:slim

USER root
WORKDIR /code
VOLUME /var/log/place

RUN apt-get update \
	&& apt-get install --no-install-recommends --no-install-suggests -y git build-essential python \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /tmp/*

EXPOSE 3000

CMD bash -c "yarn install && node app.js"
