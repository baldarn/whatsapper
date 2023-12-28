const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode-terminal');

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox']
  },
  authStrategy: new LocalAuth()
});

let receivedQr = null;

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  receivedQr = qr;
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.initialize();

const fastify = require("fastify")({ logger: true });

fastify.get("/qr", function handler(request, reply) {
  reply.send({ qr: receivedQr });
});

fastify.post("/command", async function handler(request, reply) {
  try {
    command = request.body.command;
    params = request.body.params;
    resp = await client[command](...params);
    reply.statusCode = 200;
    reply.send({resp: resp})
  } catch (e) {
    reply.statusCode = 500;
    reply.send({ error: e });
  }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
