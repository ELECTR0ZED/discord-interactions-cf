import { 
    SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import { ChatInputCommandInteraction } from '../structures/ChatInputCommandInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';
import { SlashCommandBuilderExecuteFunction } from './SlashCommandBuilder';

SlashCommandSubcommandBuilder.prototype.setExecute = function (fn: SlashCommandBuilderExecuteFunction) {
    if (fn.constructor.name !== 'AsyncFunction') {
        throw new Error('Execute function must be asynchronous');
    }
    this.executeFunction = fn;
    return this;
};
SlashCommandSubcommandBuilder.prototype.execute = async function (
    interaction: ChatInputCommandInteraction,
    env: Env
): Promise<APIInteractionResponse> {
    if (this.executeFunction) {
        await this.executeFunction(interaction, env);
        if (!interaction.response) {
            throw new Error('No response from slash command execute function');
        }
        return interaction.response;
    } else {
        throw new Error('No execute function set');
    }
};

export { SlashCommandSubcommandBuilder };