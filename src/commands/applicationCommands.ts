import type { ApplicationCommandData, ApplicationCommandOptionData } from "discord.js";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { allChatInputCommands } from "./chatInput";

export default function getAllApplicationCommands(): ApplicationCommandData[] {
  const applicationCommands: ApplicationCommandData[] = [];

  for (const command of allChatInputCommands) {
    applicationCommands.push({
      name: command.name,
      description: command.description,
      type: ApplicationCommandType.ChatInput,
      ...command.options && {
        options: command.options.map(option => {
          if ("autocomplete" in option) return { ...option, autocomplete: true };
          return option;
        }) as ApplicationCommandOptionData[],
      },
      ...!command.public && { defaultMemberPermissions: PermissionFlagsBits.Administrator },
    });
  }

  return applicationCommands;
}
