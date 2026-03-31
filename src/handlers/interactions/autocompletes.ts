import type{ ApplicationCommandOptionChoiceData, AutocompleteInteraction, Awaitable } from "discord.js";

export type Autocomplete<QueryType extends number | string> = (query: QueryType, interaction: AutocompleteInteraction<"cached">) => Awaitable<Array<ApplicationCommandOptionChoiceData<QueryType>>>;
