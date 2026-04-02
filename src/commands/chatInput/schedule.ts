import type { InteractionReplyOptions, InteractionUpdateOptions, Snowflake, TopLevelComponentData } from "discord.js";
import { parseDate } from "chrono-node";
import { ButtonStyle, ChannelType, ComponentType, MessageFlags, SelectMenuDefaultValueType, TextInputStyle, time, TimestampStyles } from "discord.js";
import type { ChatInputCommand } from ".";
import { ScheduledMessage } from "../../database/models/ScheduledMessage";
import { buttons } from "../../handlers/interactions/components";
import { modals } from "../../handlers/interactions/modals";
import { jobs, setupScheduledMessage } from "../../handlers/schedule";

export default {
  name: "schedule",
  description: "List all scheduled messages and manage them",
  async execute(interaction) {
    return void interaction.reply(await refreshList(interaction.id, interaction.user.id));
  },
} satisfies ChatInputCommand;

const messagesPerPage = 5;

async function refreshList(uniqueIdentifier: string, userId: Snowflake, page = 0): Promise<InteractionReplyOptions & InteractionUpdateOptions> {
  const scheduledMessages = await ScheduledMessage.find({ messageId: { $exists: false } });

  const totalPages = Math.ceil(scheduledMessages.length / messagesPerPage);

  const components: TopLevelComponentData[] = [];

  for (const message of scheduledMessages
    .sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime())
    .slice(page * messagesPerPage, (page + 1) * messagesPerPage)
  ) {
    components.push({
      type: ComponentType.Container,
      accentColor: parseInt(message.id, 16),
      components: [
        {
          type: ComponentType.TextDisplay,
          content: `### *Sendes ${time(message.sendAt, "R")} i <#${message.channelId}>*`,
        },
        { type: ComponentType.Separator },
        {
          type: ComponentType.TextDisplay,
          content: message.message,
        },
        { type: ComponentType.Separator },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              customId: `schedule:edit:${uniqueIdentifier}:${message.id}`,
              label: "Rediger",
              emoji: "✏️",
              style: ButtonStyle.Primary,
            },
            {
              type: ComponentType.Button,
              customId: `schedule:delete:${uniqueIdentifier}:${message.id}`,
              label: "Slett",
              emoji: "🗑️",
              style: ButtonStyle.Danger,
            },
          ],
        },
      ],
    });

    buttons.set(`schedule:edit:${uniqueIdentifier}:${message.id}`, {
      callback(interaction) {
        void interaction.showModal({
          customId: `schedule:edit:${uniqueIdentifier}:${message.id}`,
          title: "Rediger planlagt melding",
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "message",
                  label: "Melding",
                  style: TextInputStyle.Paragraph,
                  required: true,
                  value: message.message,
                },
              ],
            },
            {
              type: ComponentType.Label,
              label: "Velg kanalen meldingen skal sendes i",
              component: {
                type: ComponentType.ChannelSelect,
                customId: "channel",
                required: true,
                channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
                minValues: 1,
                maxValues: 1,
                defaultValues: [{ type: SelectMenuDefaultValueType.Channel, id: message.channelId }],
              },
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "time",
                  label: "Tidspunkt",
                  style: TextInputStyle.Short,
                  required: true,
                  value: message.sendAt.toISOString(),
                },
              ],
            },
          ],
        });

        modals.set(`schedule:edit:${uniqueIdentifier}:${message.id}`, modal => {
          const updatedMessage = modal.fields.getTextInputValue("message");
          const channelId = modal.fields.getSelectedChannels("channel")!.first()!.id;
          const timeInput = modal.fields.getTextInputValue("time");

          const date = parseDate(timeInput, new Date(), { forwardDate: true });

          void modal.deferUpdate();
          void interaction.editReply(date ?
            {
              components: [
                {
                  type: ComponentType.TextDisplay,
                  content: `⚠️ **Ser dette tidspunktet riktig ut?**\n> ${time(date, TimestampStyles.ShortDateMediumTime)}`,
                },
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.Button,
                      label: "Ja, det ser riktig ut",
                      customId: `schedule:edit:${uniqueIdentifier}:confirm`,
                      style: ButtonStyle.Success,
                    },
                    {
                      type: ComponentType.Button,
                      label: "Nei, jeg vil prøve på nytt",
                      customId: `schedule:edit:${uniqueIdentifier}:deny`,
                      style: ButtonStyle.Danger,
                    },
                  ],
                },
              ],
            } :
            {
              components: [
                {
                  type: ComponentType.TextDisplay,
                  content: "Jeg klarte ikke å tolke tidspunktet du oppga. Husk at tidspunktet må være på engelsk, for eksempel \"in 2 hours\" eller \"tomorrow at 3pm\".",
                },
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.Button,
                      label: "Prøv igjen",
                      customId: `schedule:edit:${uniqueIdentifier}:deny`,
                      style: ButtonStyle.Primary,
                    },
                  ],
                },
              ],
            });

          buttons.set(`schedule:edit:${uniqueIdentifier}:confirm`, {
            callback(confirmation) {
              return void ScheduledMessage.findByIdAndUpdate(message._id, {
                message: updatedMessage,
                channelId,
                sendAt: date!,
              }, { returnDocument: "after" }).then(scheduledMessage => {
                if (scheduledMessage) setupScheduledMessage(interaction.client, scheduledMessage);
                void refreshList(uniqueIdentifier, userId, page).then(options => void confirmation.update(options));
              });
            },
          });

          buttons.set(`schedule:edit:${uniqueIdentifier}:deny`, {
            callback(confirmation) {
              void confirmation.showModal({
                customId: `schedule:edit:${uniqueIdentifier}`,
                title: "Rediger planlagt melding",
                components: [
                  {
                    type: ComponentType.ActionRow,
                    components: [
                      {
                        type: ComponentType.TextInput,
                        customId: "message",
                        label: "Melding",
                        style: TextInputStyle.Paragraph,
                        required: true,
                        value: updatedMessage,
                      },
                    ],
                  },
                  {
                    type: ComponentType.Label,
                    label: "Velg kanalen meldingen skal sendes i",
                    component: {
                      type: ComponentType.ChannelSelect,
                      customId: "channel",
                      required: true,
                      channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
                      minValues: 1,
                      maxValues: 1,
                      defaultValues: [{ type: SelectMenuDefaultValueType.Channel, id: channelId }],
                    },
                  },
                  {
                    type: ComponentType.ActionRow,
                    components: [
                      {
                        type: ComponentType.TextInput,
                        customId: "time",
                        label: "Tidspunkt",
                        style: TextInputStyle.Short,
                        required: true,
                        value: timeInput,
                      },
                    ],
                  },
                ],
              });
            },
          });
        });
      },
    });

    buttons.set(`schedule:delete:${uniqueIdentifier}:${message.id}`, {
      callback(interaction) {
        void interaction.update({
          components: [
            {
              type: ComponentType.TextDisplay,
              content: "💢 Er du sikker på at du vil slette meldingen?",
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  label: "Nei, gå tilbake",
                  customId: `schedule:delete:${uniqueIdentifier}:${message.id}:no`,
                  style: ButtonStyle.Secondary,
                },
                {
                  type: ComponentType.Button,
                  label: "Ja, jeg er sikker",
                  customId: `schedule:delete:${uniqueIdentifier}:${message.id}:yes`,
                  style: ButtonStyle.Danger,
                },
              ],
            },
          ],
        });

        buttons.set(`schedule:delete:${uniqueIdentifier}:${message.id}:no`, {
          callback(confirmation) {
            void refreshList(uniqueIdentifier, userId, page).then(options => void confirmation.update(options));
          },
        });

        buttons.set(`schedule:delete:${uniqueIdentifier}:${message.id}:yes`, {
          callback(confirmation) {
            jobs.get(message.id)?.clear();
            void ScheduledMessage.deleteOne({ _id: message._id }).exec()
              .then(() => {
                void refreshList(uniqueIdentifier, userId, page).then(options => void confirmation.update(options));
              });
          },
        });
      },
    });
  }

  buttons.set(`schedule:create:${uniqueIdentifier}`, {
    callback(interaction) {
      void interaction.showModal({
        customId: `schedule:create:${uniqueIdentifier}`,
        title: "Ny planlagt melding",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                customId: "message",
                label: "Melding",
                style: TextInputStyle.Paragraph,
                required: true,
              },
            ],
          },
          {
            type: ComponentType.Label,
            label: "Velg kanalen meldingen skal sendes i",
            component: {
              type: ComponentType.ChannelSelect,
              customId: "channel",
              required: true,
              channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
              minValues: 1,
              maxValues: 1,
            },
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                customId: "time",
                label: "Tidspunkt",
                style: TextInputStyle.Short,
                required: true,
              },
            ],
          },
        ],
      });

      modals.set(`schedule:create:${uniqueIdentifier}`, modal => {
        const message = modal.fields.getTextInputValue("message");
        const channelId = modal.fields.getSelectedChannels("channel")!.first()!.id;
        const timeInput = modal.fields.getTextInputValue("time");

        const date = parseDate(timeInput, new Date(), { forwardDate: true });

        void modal.deferUpdate();
        void interaction.editReply(date ?
          {
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `⚠️ **Ser dette tidspunktet riktig ut?**\n> ${time(date, TimestampStyles.ShortDateMediumTime)}`,
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    label: "Ja, det ser riktig ut",
                    customId: `schedule:create:${uniqueIdentifier}:confirm`,
                    style: ButtonStyle.Success,
                  },
                  {
                    type: ComponentType.Button,
                    label: "Nei, jeg vil prøve på nytt",
                    customId: `schedule:create:${uniqueIdentifier}:deny`,
                    style: ButtonStyle.Danger,
                  },
                ],
              },
            ],
          } :
          {
            components: [
              {
                type: ComponentType.TextDisplay,
                content: "Jeg klarte ikke å tolke tidspunktet du oppga. Husk at tidspunktet må være på engelsk, for eksempel \"in 2 hours\" eller \"tomorrow at 3pm\".",
              },
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    label: "Prøv igjen",
                    customId: `schedule:create:${uniqueIdentifier}:deny`,
                    style: ButtonStyle.Primary,
                  },
                ],
              },
            ],
          });

        buttons.set(`schedule:create:${uniqueIdentifier}:confirm`, {
          callback(confirmation) {
            return void ScheduledMessage.create({
              message,
              channelId,
              sendAt: date!,
            }).then(scheduledMessage => {
              setupScheduledMessage(interaction.client, scheduledMessage);
              void refreshList(uniqueIdentifier, userId, page).then(options => void confirmation.update(options));
            });

          },
        });

        buttons.set(`schedule:create:${uniqueIdentifier}:deny`, {
          callback(confirmation) {
            void confirmation.showModal({
              customId: `schedule:create:${uniqueIdentifier}`,
              title: "Ny planlagt melding",
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.TextInput,
                      customId: "message",
                      label: "Melding",
                      style: TextInputStyle.Paragraph,
                      required: true,
                      value: message,
                    },
                  ],
                },
                {
                  type: ComponentType.Label,
                  label: "Velg kanalen meldingen skal sendes i",
                  component: {
                    type: ComponentType.ChannelSelect,
                    customId: "channel",
                    required: true,
                    channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
                    minValues: 1,
                    maxValues: 1,
                    defaultValues: [{ type: SelectMenuDefaultValueType.Channel, id: channelId }],
                  },
                },
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.TextInput,
                      customId: "time",
                      label: "Tidspunkt",
                      style: TextInputStyle.Short,
                      required: true,
                      value: timeInput,
                    },
                  ],
                },
              ],
            });
          },
        });
      });
    },
  });

  buttons.set(`schedule:prev:${uniqueIdentifier}`, {
    callback(interaction) {
      void refreshList(uniqueIdentifier, userId, page - 1).then(options => void interaction.update(options));
    },
  });

  buttons.set(`schedule:next:${uniqueIdentifier}`, {
    callback(interaction) {
      void refreshList(uniqueIdentifier, userId, page + 1).then(options => void interaction.update(options));
    },
  });

  return {
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `**Planlagte meldinger**\n\n${scheduledMessages.length === 0 ? "Ingen planlagte meldinger" : `Viser ${Math.min((page + 1) * messagesPerPage, scheduledMessages.length)} av ${scheduledMessages.length} planlagte meldinger`}`,
      },
      ...components,
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            customId: `schedule:create:${uniqueIdentifier}`,
            label: "Ny melding",
            emoji: "➕",
            style: ButtonStyle.Success,
          },
          {
            type: ComponentType.Button,
            customId: `schedule:prev:${uniqueIdentifier}`,
            label: "Forrige",
            emoji: "⬅️",
            style: ButtonStyle.Secondary,
            disabled: page === 0,
          },
          {
            type: ComponentType.Button,
            customId: "dummy",
            label: `${page + 1} / ${totalPages}`,
            style: ButtonStyle.Secondary,
            disabled: true,
          },
          {
            type: ComponentType.Button,
            customId: `schedule:next:${uniqueIdentifier}`,
            label: "Neste",
            emoji: "➡️",
            style: ButtonStyle.Secondary,
            disabled: page >= totalPages - 1,
          },
        ],
      },
    ],
    flags: [MessageFlags.IsComponentsV2],
  };
}
