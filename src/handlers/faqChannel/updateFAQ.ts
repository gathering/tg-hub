import type { APIEmbed, Client, MessageEditOptions } from "discord.js";
import { bold } from "discord.js";
import config from "../../config";
import formatStripper from "./formatStripper";

// colors from the TG-logo, fits well as contrasting colors in the embed
const colors = [0x2563eb, 0xea580c] as const;

export default async function updateFAQ(client: Client<true>): Promise<void> {
  if (!config.faqEndpoint) throw new Error("FAQ endpoint is not defined");
  if (!config.channels.faqChannelId) throw new Error("FAQ channel ID is not defined");

  return new Promise((resolve, reject) => {
    void Promise.all([
      fetch(config.faqEndpoint!)
        .then(res => res.json() as Promise<Record<"items", Array<{
          id: number;
          meta: {
            slug: string;
            url: `/${string}`;
          };
          title: string;
          body: string;
        }>>>),
      client.channels.fetch(config.channels.faqChannelId!, { force: false, cache: true })
        .then(channel => {
          if (!channel?.isTextBased()) throw new Error("FAQ channel is not a text channel");
          return channel.messages.fetch()
            .then(messages => {
              const message = messages.find(msg => msg.author.id === client.user.id) ?? channel.send("...");
              return message;
            });
        }),
    ])
      .then(([{ items }, message]) => {
        const messageOptions: MessageEditOptions = { content: null, embeds: [] };
        let embed: APIEmbed = {
          author: {
            name: message.guild!.name,
            icon_url: message.guild!.iconURL({ extension: "png", forceStatic: false, size: 32 })!, // eslint-disable-line camelcase
          },
          title: "FAQ",
          description: `Her finner du de mest spurte spørsmålene om The Gathering. Om du ikke finner det du lurer på her, kan du spørre i <#${config.channels.helpChannelId}>, så vil du få svar fra TG-crewet.`,
          color: colors[0],
        };
        messageOptions.embeds!.push(embed);

        for (const item of items) {
          const text = `${bold(item.title)}\n${formatStripper(item.body)}`;
          if ((embed.description?.length ?? 0) + text.length + "\n\n".length > 2048) {
            embed = { color: colors[messageOptions.embeds!.length % 2]!, description: text };
            messageOptions.embeds!.push(embed);
          } else embed.description += `\n\n${text}`;
        }

        return message.edit(messageOptions).then(() => resolve());
      })
      .catch(reject);
  });
}
