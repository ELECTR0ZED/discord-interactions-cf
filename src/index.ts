import Client from './client/client';
import { SlashCommandBuilder as OriginalSlashCommandBuilder } from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';
import { CommandInteraction } from './structures/CommandInteraction';
import { InteractionResponseCallback } from './structures/InteractionResponseCallback';

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
    private executeFunction: ((interaction: CommandInteraction) => Promise<InteractionResponseCallback>) | null = null;

    setExecute(fn: (interaction: CommandInteraction) => Promise<InteractionResponseCallback>) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: CommandInteraction): Promise<InteractionResponseCallback> {
        if (this.executeFunction) {
            return await this.executeFunction(interaction);
        } else {
            throw new Error('No execute function set');
        }
    }
}

export * from '@discordjs/builders';
export { SlashCommandBuilder, registerCommands, Client };
