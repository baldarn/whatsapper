FROM zenika/alpine-chrome:124-with-puppeteer

ADD app /workspace/app
WORKDIR /workspace
USER root
COPY package*.json .
RUN npm install
EXPOSE 3000

VOLUME /data

ENTRYPOINT ["tini", "--", "node", "app/server.js"]
