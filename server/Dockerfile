FROM node:18

ARG PRIMARY_PORT #privide port number as build argument
ENV PRIMARY_PORT=$PRIMARY_PORT 

ARG SECONDARY_PORT
ENV SECONDARY_PORT=$SECONDARY_PORT
ENV LOG_PATH=/usr/src/app/test

EXPOSE $SECONDARY_PORT
EXPOSE $PRIMARY_PORT

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY .env package-lock.json package.json /usr/src/app/
COPY test /usr/src/app/test

RUN chmod -R a+r ${LOG_PATH}
RUN npm install

# Ensure that the container runs as non-root
USER 1001