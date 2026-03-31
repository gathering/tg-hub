import type { Client } from "discord.js";
import getAllApplicationCommands from "../../commands/applicationCommands";
import config from "../../config";
import chatInputCommandHandler from "./chatInputCommands";
import componentHandler from "./components";
import modalHandler from "./modals";

export default function interactionHandler(client: Client<true>): void {
  client.on("interactionCreate", interaction => {
    if (!interaction.inCachedGuild()) return;
    if (interaction.isModalSubmit()) return modalHandler(interaction);
    if (interaction.isMessageComponent()) return componentHandler(interaction);
    if (interaction.isChatInputCommand()) return chatInputCommandHandler(interaction);
  });

  void client.guilds.cache.get(config.guildId)!.commands.set(getAllApplicationCommands()).then(() => console.log("Registered application commands"));
}
