import "dotenv/config";

if (!process.env["BOT_TOKEN"]) throw new Error("No bot token provided");
if (!process.env["HUB_VOICE_CHANNEL_ID"]) throw new Error("No hub voice channel id provided");
if (!process.env["HOTEL_CATEGORY_CHANNEL_ID"]) throw new Error("No hotel category channel id provided");

export default {
  token: process.env["BOT_TOKEN"],
  channels: {
    hubVoiceId: process.env["HUB_VOICE_CHANNEL_ID"],
    hotelCategoryId: process.env["HOTEL_CATEGORY_CHANNEL_ID"],
    faqChannelId: process.env["FAQ_CHANNEL_ID"],
    helpChannelId: process.env["HELP_CHANNEL_ID"],
  },
  faqEndpoint: process.env["FAQ_ENDPOINT"],
  color: 0x12214A,
};
