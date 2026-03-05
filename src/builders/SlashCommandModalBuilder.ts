import { ModalSubmitInteraction } from '../structures/ModalSubmitInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';

type SlashCommandModalBuilderExecuteFunction = (interaction: ModalSubmitInteraction, env: Env, data?: string[]) => Promise<void>;

export class SlashCommandModalBuilder {
    customId!: string;
    private executeFunction!: SlashCommandModalBuilderExecuteFunction;

    setExecute(fn: SlashCommandModalBuilderExecuteFunction) {
        if (fn.constructor.name !== 'AsyncFunction') {
            throw new Error('Execute function must be asynchronous');
        }
        this.executeFunction = fn;
        return this;
    }

    async execute(interaction: ModalSubmitInteraction, env: Env, data: string[]): Promise<APIInteractionResponse> {
        if (this.executeFunction) {
            await this.executeFunction(interaction, env, data);
            if (!interaction.response) {
                throw new Error('No response from slash command modal execute function');
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
}