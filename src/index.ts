import Client from './client/client';
import { SlashCommandBuilder as OriginalSlashCommandBuilder } from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';
import { CommandInteraction } from './structures/CommandInteraction';
import { InteractionResponseCallback } from './structures/InteractionResponseCallback';
import { APIInteractionResponse } from 'discord-api-types/v10';

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
    private executeFunction: ((interaction: CommandInteraction) => Promise<APIInteractionResponse>) | null = null;

    setExecute(fn: (interaction: CommandInteraction) => Promise<APIInteractionResponse>) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: CommandInteraction): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            return await this.executeFunction(interaction);
        } else {
            throw new Error('No execute function set');
        }
    }
}

export * from '@discordjs/builders';
export { SlashCommandBuilder, registerCommands, Client };
