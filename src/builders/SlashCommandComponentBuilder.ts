import { MessageComponentInteraction } from '../structures/MessageComponentInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';

type SlashCommandComponentBuilderExecuteFunction = (interaction: MessageComponentInteraction, env: Env, data?: string[]) => Promise<void>;

export class SlashCommandComponentBuilder {
    customId!: string;
    authorOnly = true;
    private executeFunction!: SlashCommandComponentBuilderExecuteFunction;

    setExecute(fn: SlashCommandComponentBuilderExecuteFunction) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: MessageComponentInteraction, env: Env, data: string[]): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            await this.executeFunction(interaction, env, data);
            if (!interaction.response) {
                throw new Error('No response from slash command component execute function');
            }
            return interaction.response;
        } else {
            throw new Error('No execute function set');
        }
    }

    setCustomId(customId: string) {
        this.customId = customId;
        return this;
    }

    setAuthorOnly(authorOnly: boolean) {
        this.authorOnly = authorOnly;
        return this;
    }
}