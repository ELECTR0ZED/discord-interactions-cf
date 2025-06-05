import Client from './client/client';
import { 
    SlashCommandBuilder as OriginalSlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    ApplicationCommandOptionBase,
} from '@discordjs/builders';
import { registerCommands } from './utils/registerCommands';
import { ChatInputCommandInteraction } from './structures/ChatInputCommandInteraction';
import { MessageComponentInteraction } from './structures/MessageComponentInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';
import { AutocompleteInteraction } from './structures/AutocompleteInteraction';
import { ModalSubmitInteraction } from './structures/ModalSubmitInteraction';

declare module '@discordjs/builders' {
    interface SlashCommandSubcommandBuilder {
        executeFunction: SlashCommandBuilderExecuteFunction
        setExecute(fn: SlashCommandBuilderExecuteFunction): this;
        execute(interaction: ChatInputCommandInteraction, env: Env): Promise<APIInteractionResponse>;
    }

    interface SlashCommandStringOption {
        executeFunction: SlashCommandStringOptionExecuteFunction
        setExecute(fn: SlashCommandStringOptionExecuteFunction): this;
        execute(interaction: AutocompleteInteraction, value: string, env: Env): Promise<APIInteractionResponse>;
    }
}

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

type SlashCommandStringOptionExecuteFunction = (interaction: AutocompleteInteraction, value: string, env: Env) => Promise<void>;

SlashCommandStringOption.prototype.setExecute = function (fn: SlashCommandStringOptionExecuteFunction) {
    if (fn.constructor.name !== 'AsyncFunction') {
        throw new Error('Execute function must be asynchronous');
    }
    this.executeFunction = fn;
    return this;
};
SlashCommandStringOption.prototype.execute = async function (
    interaction: AutocompleteInteraction,
    value: string,
    env: Env
): Promise<APIInteractionResponse> {
    if (this.executeFunction) {
        await this.executeFunction(interaction, value, env);
        if (!interaction.response) {
            throw new Error('No response from slash command autocomplete execute function');
        }
        return interaction.response;
    } else {
        throw new Error('No execute function set');
    }
}

export interface ApplicationCommandOptionBaseExtended extends ApplicationCommandOptionBase {
    execute?: typeof SlashCommandStringOption.prototype.execute
}

type SlashCommandBuilderExecuteFunction = (interaction: ChatInputCommandInteraction, env: Env) => Promise<void>;

class SlashCommandBuilder extends OriginalSlashCommandBuilder {
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

type SlashCommandModalBuilderExecuteFunction = (interaction: ModalSubmitInteraction, env: Env, data?: string[]) => Promise<void>;

class SlashCommandModalBuilder {
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

export * from '@discordjs/builders';
export { SlashCommandBuilder, SlashCommandComponentBuilder, SlashCommandModalBuilder, registerCommands, Client, AutocompleteInteraction };
export * from 'discord-api-types/v10';

// Structures
export * from './structures/Attachment';
export * from './structures/AutocompleteInteraction';
export * from './structures/Base';
export * from './structures/BaseInteraction';
export * from './structures/ChatInputCommandInteraction';
export * from './structures/CommandInteractionOptionResolver';
export * from './structures/InteractionGuildMember';
export * from './structures/InteractionResponseCallback';
export * from './structures/Message';
export * from './structures/MessageComponentInteraction';
export * from './structures/ModalSubmitInteraction';
export * from './structures/PartialInteractionChannel';
export * from './structures/PartialInteractionGuild';
export * from './structures/User';