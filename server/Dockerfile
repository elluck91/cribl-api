FROM node:18

ENV PORT=3002
ENV LOG_PATH=/var/log
EXPOSE $PORT

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY .env package-lock.json package.json /usr/src/app/

RUN chmod -R a+r /var/log
RUN npm install

CMD ["node", "src/index.js"]

# Ensure that the container runs as non-root
USER 1001