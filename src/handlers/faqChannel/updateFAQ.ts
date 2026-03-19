import type { APIEmbed, Client, MessageEditOptions } from "discord.js";
import { bold, ChannelType, quote } from "discord.js";
import config from "../../config";
import colorBlender from "./colorBlender";
import formatStripper from "./formatStripper";

export default async function updateFAQ(client: Client<true>): Promise<void> {
  if (!config.faqEndpoint) throw new Error("FAQ endpoint is not defined");
  if (!config.channels.faqChannelId) throw new Error("FAQ channel ID is not defined");

  return new Promise((resolve, reject) => {
    void Promise.all([
      fetch(config.faqEndpoint!)
        .then(res => res.json() as Promise<Record<"items", Array<{
          body: string;
          id: number;
          meta: {
            slug: string;
            url: `/${string}`;
          };
          title: string;
        }>>>),
      client.channels.fetch(config.channels.faqChannelId!, { force: false, cache: true })
        .then(channel => {
          if (channel?.type !== ChannelType.GuildText) throw new Error("FAQ channel is not a text channel, or is not a channel I can send messages in");
          return channel.messages.fetch()
            .then(async _messages => {
              const messages = Array.from(_messages.values());
              const botMessages = messages.filter(msg => msg.author.id === client.user.id).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
              return botMessages.length > 0 ? botMessages : [await channel.send("...")];
            });
        }),
    ])
      .then(async ([{ items }, messages]) => {
        const { channel } = (messages[0]!);
        const embeds: APIEmbed[] = [
          {
            author: {
              name: channel.guild.name,
              icon_url: channel.guild.iconURL({ extension: "png", forceStatic: false, size: 32 })!, // eslint-disable-line camelcase
            },
            title: "FAQ",
            description: `Her finner du de mest spurte spørsmålene om The Gathering. Om du ikke finner det du lurer på her, kan du spørre i <#${config.channels.helpChannelId}>, så vil du få svar fra TG-crewet.`,
          },
        ];

        for (const item of items) {
          let embed: APIEmbed = {
            title: item.title,
            url: new URL(item.meta.url, config.faqEndpoint).href,
            description: "",
          };
          const formatted = formatStripper(item.body);
          for (const [question, answer] of Object.entries(formatted)) {
            const description = `${quote(bold(question))}\n${answer}`;
            if (embed.description!.length + description.length + "\n\n".length < 4096) {
              embed.description = `${embed.description}\n\n${description}`;
            } else {
              embeds.push(embed);
              embed = { description };
            }
          }
          embeds.push(embed);
        }

        const colors = colorBlender(0xE86636, 0x12ABCF, embeds.length);
        console.log(colors, colors.length);
        embeds.forEach((embed, index) => {
          embed.color = colors[index]!;
        });

        const embedBlocks: [APIEmbed[]] = [[]];
        for (const embed of embeds) {
          const currentBlock = embedBlocks[embedBlocks.length - 1]!;
          const existingStrings = currentBlock.map(blockEmbed => [blockEmbed.title, blockEmbed.description, blockEmbed.author?.name].map(str => str?.length ?? 0).reduce((acc, len) => acc + len, 0)).reduce((acc, len) => acc + len, 0);
          const embedStrings = [embed.title, embed.description, embed.author?.name].map(str => str?.length ?? 0).reduce((acc, len) => acc + len, 0);
          if (existingStrings + embedStrings < 6000) currentBlock.push(embed);
          else embedBlocks.push([embed]);
        }

        if (embedBlocks.length === messages.length) {
          await Promise.all(messages.map((message, index) => {
            const options: MessageEditOptions = { content: null, embeds: embedBlocks[index]! };
            return message.edit(options);
          }));
        } else {
          await channel.bulkDelete(messages);
          for (const block of embedBlocks) await channel.send({ embeds: block });
        }

        resolve();
      })
      .catch(reject);
  });
}
