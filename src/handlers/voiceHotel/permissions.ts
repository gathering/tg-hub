import type { GuildMember, VoiceBasedChannel } from "discord.js";
import { PermissionFlagsBits } from "discord.js";

export const hotelRoomPermissions = {
  owner: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.MoveMembers,
    PermissionFlagsBits.Connect,
  ],
  bot: [
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.MoveMembers,
  ],
} as const;

export function checkOwner(member: GuildMember, room: VoiceBasedChannel): boolean {
  return Boolean(room.permissionsFor(member).has(hotelRoomPermissions.owner));
}
