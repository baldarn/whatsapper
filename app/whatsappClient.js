const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
  authStrategy: new LocalAuth({
    dataPath: process.env.WWEBJS_AUTH_PATH || "/data/.wwebjs_auth/",
  }),
  webVersionCache: {
    path: process.env.WWEBJS_CACHE_PATH || "/data/.wwebjs_cache/",
  },
});

let receivedQr = null;
let clientInitialized = false;

// show qr code in console
client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  receivedQr = qr;
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  clientInitialized = true;
  console.log("Client is ready!");
});

client.initialize();

module.exports = {
  client,
  getQr: () => receivedQr,
  isInitialized: () => clientInitialized,
};
