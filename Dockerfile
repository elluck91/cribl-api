FROM node:18

ENV PORT=3000
ENV BUFFER_SIZE=4096
ENV LOG_PATH=/var/log/
EXPOSE $PORT

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY test /usr/src/app/test
COPY .env package-lock.json package.json /usr/src/app/

RUN chmod -R a+r /var/log
RUN chmod -R 0777 /usr/src/app

# RUN npm install -g npm@9.1.2
RUN npm install

CMD ["node", "src/index.js"]

# Ensure that the container runs as non-root
USER 1001