import type { ActionRowData, TextInputComponentData, ModalSubmitInteraction } from "discord.js";
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

export function getModalTextInput(actionRows: ModalSubmitInteraction["components"], customId: string): string | null {
  const actionRow = actionRows.find(row => row.components.some(component => component.customId === customId));
  if (!actionRow) return null;

  const textInput = actionRow.components.find(component => component.customId === customId);
  if (!textInput) return null;

  return textInput.value;
}
