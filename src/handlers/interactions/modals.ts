import type { ActionRowData, ModalSubmitInteraction, TextInputComponentData } from "discord.js";
import { ComponentType } from "discord.js";


type Modal = (interaction: ModalSubmitInteraction<"cached">) => void;
export const modals = new Map<string, Modal>();

export default function modalHandler(interaction: ModalSubmitInteraction<"cached">): void {
  const modal = modals.get(interaction.customId);
  if (modal) modal(interaction);
}

export function createModalTextInput(options: Omit<TextInputComponentData, "type">): ActionRowData<TextInputComponentData> {
  return {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.TextInput,
        ...options,
      },
    ],
  };
}

export function getModalTextInput(actionRows: ModalSubmitInteraction["components"], customId: string): null | string {
  const actionRow = actionRows.find(row => row.type === ComponentType.ActionRow && row.components.some(component => component.customId === customId));
  if (!(actionRow?.type === ComponentType.ActionRow)) return null;

  const textInput = actionRow.components.find(component => component.customId === customId);
  if (!textInput) return null;

  return textInput.value;
}
