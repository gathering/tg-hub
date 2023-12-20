import type { AnySelectMenuInteraction, ButtonInteraction, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";

interface ButtonComponent {
  callback(interaction: ButtonInteraction<"cached">): void;
}

interface SelectMenuTypes {
  "channel": ChannelSelectMenuInteraction;
  "mentionable": MentionableSelectMenuInteraction;
  "role": RoleSelectMenuInteraction;
  "string": StringSelectMenuInteraction;
  "user": UserSelectMenuInteraction;
}

type SelectMenuComponent = {
  [K in keyof SelectMenuTypes]: {
    type: K;
    callback(interaction: SelectMenuTypes[K]): void;
  }
}[keyof SelectMenuTypes];

export const buttons = new Map<string, ButtonComponent>();
export const selectMenus = new Map<string, SelectMenuComponent>();

export default function componentHandler(interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">): void {
  const component = interaction.isButton() ? buttons.get(interaction.customId) : selectMenus.get(interaction.customId);
  if (component?.callback) component.callback(interaction as never);
}
