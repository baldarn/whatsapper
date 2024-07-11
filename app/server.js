const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// wwebjs configuration
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth({ dataPath: "/data/.wwebjs_auth/" }),
  webVersionCache: { path: "/data/.wwebjs_cache/" },
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
  reply.view("/templates/root.ejs");
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
    const chats = resp.map((chat) => ({
      name: chat.name,
      id: chat.id._serialized,
    }));
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

fastify.post("/command/:type", async function handler(request, reply) {
  if (!clientInitialized) {
    return reply.send({ error: "Client not initalized" });
  }
  try {
    const { type } = request.params;
    params = request.body.params;

    switch (type) {
      case 'media':
        remote_id = params[0]
        const media = new MessageMedia(
          params[1],
          params[2],
          params[3]
        );

        resp = await client.sendMessage(remote_id, media);
        reply.send({ resp: resp });
        break;
      default:
        reply.statusCode = 400;
        reply.send({ error: e });
    }
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
