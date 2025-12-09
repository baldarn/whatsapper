"use strict";

const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");
const { client, getQr, isInitialized } = require("./whatsappClient");

// web server configuration
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
  root: path.join(__dirname, "templates"),
});

fastify.get("/", function handler(_, reply) {
  reply.view("root.ejs");
});

fastify.get("/qr", function handler(_, reply) {
  reply.view("qr.ejs", { qr: getQr() });
});

fastify.get("/chats", async function handler(_, reply) {
  if (!isInitialized()) {
    return reply.send({ error: "Client not initialized" });
  }
  try {
    const resp = await client.getChats();
    const chats = resp.map((chat) => ({
      name: chat.name,
      id: chat.id._serialized,
    }));
    return reply.view("chats.ejs", { chats: chats });
  } catch (e) {
    reply.statusCode = 500;
    reply.send({ error: e });
  }
});

fastify.post("/command", async function handler(request, reply) {
  if (!isInitialized()) {
    return reply.send({ error: "Client not initialized" });
  }
  try {
    const { command, params } = request.body;
    // Check if client[command] is a function to avoid arbitrary code execution or errors
    if (typeof client[command] !== "function") {
      reply.statusCode = 400;
      return reply.send({ error: "Invalid command" });
    }
    const resp = await client[command](...params);
    reply.send({ resp: resp });
  } catch (e) {
    reply.statusCode = 500;
    reply.send({ error: e });
  }
});

fastify.post("/command/:type", async function handler(request, reply) {
  if (!isInitialized()) {
    return reply.send({ error: "Client not initialized" });
  }
  try {
    const { type } = request.params;
    const { params } = request.body;

    switch (type) {
      case "media": {
        const remote_id = params[0];
        const media = new MessageMedia(params[1], params[2], params[3]);

        const resp = await client.sendMessage(remote_id, media);
        reply.send({ resp: resp });
        break;
      }
      default:
        reply.statusCode = 400;
        reply.send({ error: "Invalid type" });
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
