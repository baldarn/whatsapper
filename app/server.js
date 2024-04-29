const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// wwebjs configuration
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth({ dataPath: "/data/.wwebjs_auth/" }),
  webVersionCache:
  {
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2402.5-beta.html',
    type: 'remote'
  }
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

// web server configuration
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
});

fastify.get("/", function handler(_, reply) {
  reply.statusCode = 200;
  reply.send()
});

fastify.get("/qr", function handler(_, reply) {
  reply.view("/templates/qr.ejs", { qr: receivedQr });
});

fastify.get("/chats", async function handler(_, reply) {
  if (!clientInitialized) {
    return reply.send({ error: "Client not initalized" });
  }
  try {
    resp = await client.getChats();
    const chats = resp.map((chat) => ({ name: chat.name, id: chat.id._serialized }));
    return reply.view("/templates/chats.ejs", { chats: chats });
  } catch (e) {
    reply.statusCode = 500;
    reply.send({ error: e });
  }
});

fastify.post("/command", async function handler(request, reply) {
  if (!clientInitialized) {
    return reply.send({ error: "Client not initalized" });
  }
  try {
    command = request.body.command;
    params = request.body.params;
    resp = await client[command](...params);
    reply.send({ resp: resp });
  } catch (e) {
    reply.statusCode = 500;
    reply.send({ error: e });
  }
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
