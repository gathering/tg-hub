# Hub bot

A very simple bot for our Discord server. When you join the Hub channel, it creates a new room for you and moves you in there.

## Setup

```bash
docker run -d \
  --name tg-hub \
  -e "BOT_TOKEN=xxx" \
  -e "HUB_VOICE_CHANNEL_ID=xxx" \
  -e "HOTEL_CATEGORY_CHANNEL_ID=xxx" \
  ghcr.io/gathering/tg-hub:latest
```
