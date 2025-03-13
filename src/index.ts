import { Client, IntentsBitField } from "discord.js";
import config from "./config";
import faqChannelHandler from "./handlers/faqChannel";
import interactionHandler from "./handlers/interactions";
import voiceHotelHandler from "./handlers/voiceHotel";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

void client
  .on("ready", trueClient => {
    console.log("Client connected");
    faqChannelHandler(trueClient);
    interactionHandler(trueClient);
    voiceHotelHandler(trueClient);
  })
  .login(config.token);
