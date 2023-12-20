import type { Client, CategoryChannel } from "discord.js";
import { ChannelType } from "discord.js";
import config from "../../config";

export default async function cleanHotel(client: Client): Promise<void> {
  const hotelCategory = (await client.channels.fetch(config.channels.hotelCategoryId, { cache: true, force: false })) as CategoryChannel;
  hotelCategory.children.cache.forEach(channel => {
    if (channel.type === ChannelType.GuildVoice && channel.members.size === 0) void channel.delete();
  });
}
