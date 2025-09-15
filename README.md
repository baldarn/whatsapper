# Whatsapper

A tiny web api on [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

## Usage

After run, the QR code for association will be displayed on the console.
Is also possible to get the string version from the path `/qr`

After this, whatsapper is logged and you can forward all `whatsapp-web.js` calls via the `/command` api with this json syntax:

```json
{
  "command" : "cmd",
  "params": ["param1", "param2"],
}
```

this will be forwarded to the whatsapp-web.js and you will get back the return of the lib.

## Special commands

To send media, call with a `POST` via the `/command/media` api with this json syntax:

```json
    "params": ["remote_id to send the media to", "image/png", "29y78y424GWIOJFADIJFADS", "filename.png"],
```

## Run

```shell
npm i
node server.js
```

## Run with docker compose

`docker compose up`


## Push on docker hub (for me to remember)

`docker buildx build --push --platform linux/amd64 --tag baldarn/whatsapper:TAG --tag baldarn/whatsapper:latest .`
