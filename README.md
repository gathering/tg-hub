# Hub bot

A very simple bot for our Discord server.

## Features

* **Voice hub:** Moves users to a voice channel when they join a hub voice channel, making it easier for people to go in their own voice channel without cluttering the server too much.
* **FAQ sync:** Syncs the FAQ channel with the [FAQ from TG.no](https://tg.no/practical) every hour.

## Setup

```bash
docker run -d \
  --name tg-hub \
  -e "BOT_TOKEN=xxx" \
  -e "HUB_VOICE_CHANNEL_ID=xxx" \
  -e "HOTEL_CATEGORY_CHANNEL_ID=xxx" \
  -e "FAQ_CHANNEL_ID=xxx" \
  -e "HELP_CHANNEL_ID=xxx" \
  -e "FAQ_ENDPOINT=xxx" \
  ghcr.io/gathering/tg-hub:latest
```
