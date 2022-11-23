FROM node:18

ENV PORT=3001
EXPOSE $PORT

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY public /usr/src/app/public
COPY .babelrc package-lock.json package.json webpack.config.js /usr/src/app/

RUN npm install --include=dev
CMD ["npm", "run", "start"]

# Ensure that the container runs as non-root
# USER 1001