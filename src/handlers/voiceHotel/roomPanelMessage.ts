import { PermissionFlagsBits, type InteractionReplyOptions, type MessageCreateOptions, type MessageEditOptions, type VoiceChannel, ChannelType, TextInputStyle, bold, italic, ComponentType, ButtonStyle } from "discord.js";
import config from "../../config";
import roomName from "../../constants/roomName";
import { buttons } from "../interactions/components";
import { createModalTextInput, getModalTextInput, modals } from "../interactions/modals";
import { checkOwner } from "./permissions";

export default function roomPanelMessage(channel: VoiceChannel): MessageCreateOptions & MessageEditOptions {
  const everyone = channel.permissionOverwrites.cache.find(overwrite => overwrite.id === channel.guild.roles.everyone.id);
  const isHidden = Boolean(everyone?.deny.has(PermissionFlagsBits.ViewChannel));
  const isLocked = isHidden || Boolean(everyone?.deny.has(PermissionFlagsBits.Connect));

  return {
    embeds: [
      {
        author: {
          name: channel.name,
          // eslint-disable-next-line camelcase
          icon_url: channel.client.user.avatarURL()!,
        },
        color: config.color,
        description: "Welcome to your new room! This is where the magic happens. This is the control panel where you can control your room.",
        fields: [
          isHidden ?
            { name: "🫥 Hidden", value: `Your room is hidden in the shadow realms. ${italic("This also means the channel is locked.")}` } :
            { name: "👀 Visible", value: "Everyone can see your room." },
          isLocked ?
            { name: "🔓 Locked", value: "Nobody can join, even after being in the channel." } :
            { name: "🔓 Unlocked", value: "Everyone can see and join the channel." },
          {
            name: "♾️ Max limit",
            value: channel.userLimit ?
              `The user limit is set to ${bold(`${channel.userLimit} users`)}.` :
              "There is no user limit to the channel.",
          },
        ].map(field => ({ inline: true, ...field })),
        footer: { text: "This channel will be deleted when everyone has left the channel." },
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            emoji: isHidden ? "🫥" : "👀",
            customId: "hotelroom:hide",
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: isLocked ? "🔓" : "🔒",
            customId: "hotelroom:lock",
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: "📛",
            customId: "hotelroom:name",
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: "🔨",
            customId: "hotelroom:kick",
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            emoji: "♾️",
            customId: "hotelroom:user_limit",
            style: ButtonStyle.Primary,
          },
        ],
      },
    ],
  };
}

const noPermission: InteractionReplyOptions = { ephemeral: true, content: "You're not the owner of this room." };

buttons.set("hotelroom:hide", {
  callback(button) {
    const room = button.member.voice.channel;
    if (room?.type !== ChannelType.GuildVoice || !checkOwner(button.member, room)) return void button.reply(noPermission);

    const isHidden = room.permissionOverwrites.cache.find(overwrite => overwrite.id === button.guild.roles.everyone.id)?.deny.has(PermissionFlagsBits.ViewChannel);
    void room.permissionOverwrites.edit(button.guild.roles.everyone, { ViewChannel: isHidden ? null : false })
      .then(newRoom => button.update(roomPanelMessage(newRoom as typeof room)));
  },
});

buttons.set("hotelroom:lock", {
  callback(button) {
    const room = button.member.voice.channel;
    if (room?.type !== ChannelType.GuildVoice || !checkOwner(button.member, room)) return void button.reply(noPermission);

    const isLocked = room.permissionOverwrites.cache.find(overwrite => overwrite.id === button.guild.roles.everyone.id)?.deny.has(PermissionFlagsBits.Connect);
    void room.permissionOverwrites.edit(button.guild.roles.everyone, { Connect: isLocked ? null : false })
      .then(newRoom => button.update(roomPanelMessage(newRoom as typeof room)));
  },
});

buttons.set("hotelroom:name", {
  callback(button) {
    const room = button.member.voice.channel;
    if (room?.type !== ChannelType.GuildVoice || !checkOwner(button.member, room)) return void button.reply(noPermission);

    void button.showModal({
      title: "Set room name",
      customId: "hotelroom:name",
      components: [
        createModalTextInput({
          label: "Room name",
          placeholder: roomName(button.member.voice),
          style: TextInputStyle.Short,
          customId: "name",
          minLength: 1,
          maxLength: 100,
          required: false,
          value: room.name,
        }),
      ],
    });
  },
});

modals.set("hotelroom:name", modal => {
  const room = modal.member.voice.channel;
  if (room?.type !== ChannelType.GuildVoice || !checkOwner(modal.member, room)) return void modal.reply(noPermission);

  const name = getModalTextInput(modal.components, "name");
  const newName = name?.length ? name : roomName(modal.member.voice);

  void room.setName(newName)
    .then(newRoom => {
      void modal.reply({ content: `Room name has been changed to ${bold(newRoom.name)}.` });
      void modal.message?.edit(roomPanelMessage(newRoom));
    });
});

buttons.set("hotelroom:kick", {
  callback(button) {
    const room = button.member.voice.channel;
    if (room?.type !== ChannelType.GuildVoice || !checkOwner(button.member, room)) return void button.reply(noPermission);

    void button.reply({ ephemeral: true, content: "You can kick a user by right-clicking them and clicking Disconnect." });
  },
});

buttons.set("hotelroom:user_limit", {
  callback(button) {
    const room = button.member.voice.channel;
    if (room?.type !== ChannelType.GuildVoice || !checkOwner(button.member, room)) return void button.reply(noPermission);

    void button.showModal({
      title: "Set max limit",
      customId: "hotelroom:max",
      components: [
        createModalTextInput({
          label: "Max limit between 0 and 99",
          placeholder: "Leave blank to disable the limit",
          style: TextInputStyle.Short,
          customId: "limit",
          minLength: "1".length,
          maxLength: "99".length,
          required: false,
          ...room.userLimit && { value: room.userLimit.toString() },
        }),
      ],
    });
  },
});

modals.set("hotelroom:max", modal => {
  const room = modal.member.voice.channel;
  if (room?.type !== ChannelType.GuildVoice || !checkOwner(modal.member, room)) return void modal.reply(noPermission);

  const limit = getModalTextInput(modal.components, "limit");
  const newLimit = limit ? Number(limit) : 0;

  void room.setUserLimit(newLimit)
    .then(newRoom => {
      void modal.reply({ content: `Max limit has been changed to ${bold(String(newRoom.userLimit) || "unlimited")}.` });
      void modal.message?.edit(roomPanelMessage(newRoom));
    });
});
