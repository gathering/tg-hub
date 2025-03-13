import type { Client } from "discord.js";
import config from "../../config";
import updateFAQ from "./updateFAQ";

export default function faqChannelHandler(client: Client<true>): void {
  if (!config.faqEndpoint || !config.channels.faqChannelId) return console.warn("FAQ endpoint or channel ID is not defined; skipping the FAQ channel handler.");
  void updateFAQ(client);
  setInterval(() => void updateFAQ(client), 1000 * 60 * 60);
}
