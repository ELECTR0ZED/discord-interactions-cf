import { 
    SlashCommandBuilder as OriginalSlashCommandBuilder,
} from '@discordjs/builders';
import { ChatInputCommandInteraction } from '../structures/ChatInputCommandInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';
import { ApplicationCommandOptionBaseExtended } from './ApplicationCommandOptionBaseExtended';

export type SlashCommandBuilderExecuteFunction = (interaction: ChatInputCommandInteraction, env: Env) => Promise<void>;

export class SlashCommandBuilder extends OriginalSlashCommandBuilder {
    options!: ApplicationCommandOptionBaseExtended[];
    private executeFunction: SlashCommandBuilderExecuteFunction | null = null;

    setExecute(fn: SlashCommandBuilderExecuteFunction) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: ChatInputCommandInteraction, env: Env): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            await this.executeFunction(interaction, env);
            if (!interaction.response) {
                throw new Error('No response from slash command execute function');
            }
            return interaction.response;
        } else {
            throw new Error('No execute function set');
        }
    }
}