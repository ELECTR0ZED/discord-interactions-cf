import Client from './client/client';
import { SlashCommandBuilder as OriginalSlashCommandBuilder } from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';
import { CommandInteraction } from './structures/CommandInteraction';
import { InteractionResponseCallback } from './structures/InteractionResponseCallback';
import { APIInteractionResponse } from 'discord-api-types/v10';

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
    private executeFunction: ((interaction: CommandInteraction) => Promise<void>) | null = null;

    setExecute(fn: (interaction: CommandInteraction) => Promise<void>) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: CommandInteraction): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            await this.executeFunction(interaction);
            if (!interaction.response) {
                throw new Error('No response from slash command execute function');
            }
            return interaction.response;
        } else {
            throw new Error('No execute function set');
        }
    }
}

export * from '@discordjs/builders';
export { SlashCommandBuilder, registerCommands, Client };
