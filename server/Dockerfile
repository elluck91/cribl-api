FROM node:18

ENV PORT=3002
ENV LOG_PATH=/usr/src/app/test
EXPOSE $PORT

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY .env package-lock.json package.json /usr/src/app/
COPY test /usr/src/app/test

RUN chmod -R a+r /var/log
RUN npm install

CMD ["node", "src/primary.js"]

# Ensure that the container runs as non-root
USER 1001