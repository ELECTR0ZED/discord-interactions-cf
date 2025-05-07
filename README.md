
# `@electr0zed/discord-interactions-cf`

[![npm](https://img.shields.io/npm/v/@electr0zed/discord-interactions-cf)](https://www.npmjs.com/package/@electr0zed/discord-interactions-cf)

A minimal and performant module for handling [Discord Interactions](https://discord.com/developers/docs/interactions/receiving-and-responding) in [Cloudflare Workers](https://developers.cloudflare.com/workers/). Designed for speed, simplicity, and ease of deployment.

## 🚀 Installation

```bash
npm install @electr0zed/discord-interactions-cf
```

## 🔧 Environment Variables

Set the following environment variables in your Cloudflare Worker:

* `PUBLIC_KEY` – *(required)* Your bot’s public key (used to verify incoming requests)
* `CLIENT_ID` – *(required)* Your bot’s client ID
* `TOKEN` – *(optional)* Bot token, only needed for command registration

## ⚙️ Compatibility Flags

Make sure to enable the `nodejs_compat` flag in your `wrangler.toml` or `wrangler.jsonc` config:

```json
"compatibility_flags": ["nodejs_compat"]
```

## 🌐 Worker URL

The public URL of your deployed Cloudflare Worker **is the URL you give to Discord** as your interaction endpoint.

To register commands, make a `GET` or `POST` request to:

```plaintext
<your-worker-url>/register
```

with the following header:

```plaintext
Authorization: Bearer <your-bot-token>
```

> Ensure your bot token (`TOKEN`) is set as an environment variable and passed in the request header as shown above.

## 📦 Status

This package is **usable**, but still in **alpha**. Expect breaking changes as the API evolves.

## 📁 Examples

See the [`examples/`](./examples) directory for working usage, command registration, and response handling.
