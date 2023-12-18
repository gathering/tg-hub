import type { CategoryChannel, VoiceChannel, VoiceState } from "discord.js";
import { ChannelType, Client, IntentsBitField } from "discord.js";
import config from "./config";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.on("ready", () => {
  console.log("Client connected");
  void cleanUpHotel();
});

client.on("voiceStateUpdate", async (_, newState) => {
  await cleanUpHotel();
  if (newState.channelId === config.channels.hubVoiceId) {
    const newRoom = await createNewRoom(newState);
    void newState.setChannel(newRoom);
  }
});

void client.login(config.token);

async function createNewRoom(voiceState: VoiceState): Promise<VoiceChannel> {
  const hotelCategory = (await client.channels.fetch(config.channels.hotelCategoryId, { cache: true, force: false })) as CategoryChannel;
  return hotelCategory.guild.channels.create({ name: roomName(voiceState), parent: hotelCategory, type: ChannelType.GuildVoice });
}

async function cleanUpHotel(): Promise<void> {
  const hotelCategory = (await client.channels.fetch(config.channels.hotelCategoryId, { cache: true, force: false })) as CategoryChannel;
  hotelCategory.children.cache.forEach(channel => {
    if (channel.type === ChannelType.GuildVoice && channel.members.size === 0) void channel.delete();
  });
}

function roomName(voiceState: VoiceState) {
  const id = voiceState.member?.id ?? Math.floor(Math.random() * 1000);
  return `Rom ${Number(id) % 1000 + 1}`;
}
