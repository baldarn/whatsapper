FROM zenika/alpine-chrome:with-puppeteer

WORKDIR /app
USER root
COPY package*.json .
RUN npm install
COPY server.js .
EXPOSE 3000

ENTRYPOINT ["tini", "--", "node", "server.js"]
