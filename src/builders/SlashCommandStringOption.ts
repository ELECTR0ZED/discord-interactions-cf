import { 
    SlashCommandStringOption,
} from '@discordjs/builders';
import { AutocompleteInteraction } from '../structures/AutocompleteInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';

export type SlashCommandStringOptionExecuteFunction = (interaction: AutocompleteInteraction, value: string, env: Env) => Promise<void>;

SlashCommandStringOption.prototype.setExecute = function (fn: SlashCommandStringOptionExecuteFunction) {
    if (fn.constructor.name !== 'AsyncFunction') {
        throw new Error('Execute function must be asynchronous');
    }
    this.executeFunction = fn;
    return this;
};
SlashCommandStringOption.prototype.execute = async function (
    interaction: AutocompleteInteraction,
    value: string,
    env: Env
): Promise<APIInteractionResponse> {
    if (this.executeFunction) {
        await this.executeFunction(interaction, value, env);
        if (!interaction.response) {
            throw new Error('No response from slash command autocomplete execute function');
        }
        return interaction.response;
    } else {
        throw new Error('No execute function set');
    }
}