import type { GuildMember, VoiceBasedChannel } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

export const hotelRoomPermissions = {
  owner: [
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.DeafenMembers,
    PermissionFlagsBits.Connect,
  ],
  bot: [
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.MoveMembers,
  ],
} as const;

export function checkOwner(member: GuildMember, room: VoiceBasedChannel): boolean {
  return Boolean(room.permissionsFor(member).has(hotelRoomPermissions.owner));
}
