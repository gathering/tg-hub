import type { ChatInputCommand } from ".";
import { msToHumanShortTime } from "../../utils/time";

export default {
  name: "ping",
  description: "Pong!",
  public: true,
  async execute(interaction) {
    const now = Date.now();
    await interaction.deferReply();
    return void interaction.editReply(`🏓 \`${Date.now() - now}ms\` | 💓 \`${Math.ceil(interaction.guild.shard.ping)}ms\` | ⏱️ \`${msToHumanShortTime(interaction.client.uptime)}\``);
  },
} satisfies ChatInputCommand;
