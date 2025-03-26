import Client from './client/client';
import { SlashCommandBuilder as OriginalSlashCommandBuilder } from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';
import { ChatInputCommandInteraction } from './structures/ChatInputCommandInteraction';
import { MessageComponentInteraction } from './structures/MessageComponentInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';

type SlashCommandBuilderExecuteFunction = (interaction: ChatInputCommandInteraction, env: Env) => Promise<void>;

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
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

type SlashCommandComponentBuilderExecuteFunction = (interaction: MessageComponentInteraction, env: Env, data?: string[]) => Promise<void>;

class SlashCommandComponentBuilder {
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

export * from '@discordjs/builders';
export { SlashCommandBuilder, SlashCommandComponentBuilder, registerCommands, Client };
export * from 'discord-api-types/v10';

// Structures
export * from './structures/Attachment';
export * from './structures/Base';
export * from './structures/BaseInteraction';
export * from './structures/ChatInputCommandInteraction';
export * from './structures/CommandInteraction';
export * from './structures/CommandInteractionOptionResolver';
export * from './structures/InteractionGuildMember';
export * from './structures/InteractionResponseCallback';
export * from './structures/PartialInteractionChannel';
export * from './structures/PartialInteractionGuild';
export * from './structures/User';