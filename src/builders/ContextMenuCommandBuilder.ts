import { 
    ContextMenuCommandBuilder as OriginalContextMenuCommandBuilder,
} from '@discordjs/builders';
import { APIInteractionResponse } from 'discord-api-types/v10';
import { ApplicationCommandOptionBaseExtended } from './ApplicationCommandOptionBaseExtended';
import { MessageContextMenuCommandInteraction } from '../structures/MessageContextMenuCommandInteraction';
import { UserContextMenuCommandInteraction } from '../structures/UserContextMenuCommandInteraction';

type AnyContextMenuCommandInteraction = MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;

export type ContextMenuCommandBuilderExecuteFunction = (interaction: AnyContextMenuCommandInteraction, env: Env) => Promise<void>;

export class ContextMenuCommandBuilder extends OriginalContextMenuCommandBuilder {
    options!: ApplicationCommandOptionBaseExtended[];
    private executeFunction: ContextMenuCommandBuilderExecuteFunction | null = null;

    setExecute(fn: ContextMenuCommandBuilderExecuteFunction) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: AnyContextMenuCommandInteraction, env: Env): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            await this.executeFunction(interaction, env);
            if (!interaction.response) {
                throw new Error('No response from context menu command execute function');
            }
            return interaction.response;
        } else {
            throw new Error('No execute function set');
        }
    }
}