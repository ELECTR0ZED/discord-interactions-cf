import Client from './client/client';
import { SlashCommandBuilder as OriginalSlashCommandBuilder } from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
    private executeFunction: ((interaction: any) => Promise<void>) | null = null;

    setExecute(fn: (interaction: any) => Promise<void>) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: any) {
        if (this.executeFunction) {
            await this.executeFunction(interaction);
        } else {
            throw new Error('No execute function set');
        }
    }
}

export * from '@discordjs/builders';
export { SlashCommandBuilder, registerCommands, Client };
