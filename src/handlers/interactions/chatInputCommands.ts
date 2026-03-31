import type { ChatInputCommandInteraction } from "discord.js";
import { allChatInputCommands } from "../../commands/chatInput";

export default function chatInputCommandHandler(interaction: ChatInputCommandInteraction<"cached">): void {
  const command = allChatInputCommands.find(({ name }) => name === interaction.commandName);
  if (command) return void command.execute(interaction);
}
