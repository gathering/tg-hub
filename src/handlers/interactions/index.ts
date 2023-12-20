import type { Client } from "discord.js";
import componentHandler from "./components";
import modalHandler from "./modals";

export default function interactionHandler(client: Client<true>): void {
  client.on("interactionCreate", interaction => {
    if (!interaction.inCachedGuild()) return;
    if (interaction.isModalSubmit()) return modalHandler(interaction);
    if (interaction.isMessageComponent()) return componentHandler(interaction);
  });
}
