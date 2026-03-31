import type { ApplicationCommandAutocompleteNumericOptionData, ApplicationCommandAutocompleteStringOptionData, ApplicationCommandBooleanOptionData, ApplicationCommandChannelOptionData, ApplicationCommandMentionableOptionData, ApplicationCommandNonOptionsData, ApplicationCommandRoleOptionData, ApplicationCommandUserOptionData, Awaitable, ChatInputCommandInteraction } from "discord.js";
import { readdirSync } from "node:fs";
import type { Autocomplete } from "../../handlers/interactions/autocompletes";

export interface ChatInputCommand {
  description: string;
  execute(interaction: ChatInputCommandInteraction<"cached">): Awaitable<void>;
  name: string;
  options?: Array<
    | ({ autocomplete: Autocomplete<number> } & Omit<ApplicationCommandAutocompleteNumericOptionData, "autocomplete">)
    | ({ autocomplete: Autocomplete<string> } & Omit<ApplicationCommandAutocompleteStringOptionData, "autocomplete">)
    | ApplicationCommandBooleanOptionData
    | ApplicationCommandChannelOptionData
    | ApplicationCommandMentionableOptionData
    | ApplicationCommandNonOptionsData
    | ApplicationCommandRoleOptionData
    | ApplicationCommandUserOptionData
  >;
  public?: true;
}

export const allChatInputCommands = readdirSync(__dirname)
  .filter(file => !file.includes("index"))
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access -- we need this to be synchronous
  .map(file => require(`./${file}`).default as ChatInputCommand);
