import type { VoiceState, VoiceChannel, CategoryChannel } from "discord.js";
import { ChannelType } from "discord.js";
import config from "../../config";
import roomName from "../../constants/roomName";
import { hotelRoomPermissions } from "./permissions";
import roomPanelMessage from "./roomPanelMessage";

export default async function createNewRoom(voiceState: VoiceState): Promise<VoiceChannel> {
  const hotelCategory = (await voiceState.client.channels.fetch(config.channels.hotelCategoryId, { cache: true, force: false })) as CategoryChannel;
  const name = roomName(voiceState);
  const channel = await hotelCategory.guild.channels.create({
    name,
    type: ChannelType.GuildVoice,
    parent: hotelCategory,
    permissionOverwrites: [
      {
        id: voiceState.member!,
        allow: hotelRoomPermissions.owner,
      },
      {
        id: voiceState.client.user,
        allow: [...hotelRoomPermissions.owner, ...hotelRoomPermissions.bot],
      },
    ],
  });
  void channel.send({
    ...voiceState.member && {
      content: voiceState.member.toString(),
      allowedMentions: { users: [voiceState.member.id] },
    },
    ...roomPanelMessage(channel),
  });
  return channel;
}
