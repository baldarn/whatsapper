FROM zenika/alpine-chrome:with-puppeteer

WORKDIR /app
USER root
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000

# Set the command to run your app. Adjust accordingly.
CMD ["node", "server.js"]
