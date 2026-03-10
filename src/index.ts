import Client from './client/client';
import { registerCommands } from './utils/registerCommands';
import { ChatInputCommandInteraction } from './structures/ChatInputCommandInteraction';
import { APIInteractionResponse } from 'discord-api-types/v10';
import { AutocompleteInteraction } from './structures/AutocompleteInteraction';
import { SlashCommandBuilderExecuteFunction } from './builders/SlashCommandBuilder';
import { SlashCommandStringOptionExecuteFunction } from './builders/SlashCommandStringOption';

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

export * from '@discordjs/builders';
export { registerCommands, Client, AutocompleteInteraction };
export * from 'discord-api-types/v10';

// Builders
export * from './builders/ApplicationCommandOptionBaseExtended';
export * from './builders/SlashCommandComponentBuilder';
export * from './builders/SlashCommandModalBuilder';
export { SlashCommandBuilder, SlashCommandBuilderExecuteFunction } from './builders/SlashCommandBuilder';
export * from './builders/SlashCommandStringOption';
export * from './builders/SlashCommandSubcommandBuilder';
export { ContextMenuCommandBuilder, ContextMenuCommandBuilderExecuteFunction, AnyContextMenuCommandInteraction } from './builders/ContextMenuCommandBuilder';

// Structures
export * from './structures/Attachment';
export * from './structures/AutocompleteInteraction';
export * from './structures/Base';
export * from './structures/BaseInteraction';
export * from './structures/ChatInputCommandInteraction';
export * from './structures/CommandInteractionOptionResolver';
export * from './structures/ContextMenuCommandInteraction';
export * from './structures/InteractionGuildMember';
export * from './structures/InteractionResponseCallback';
export * from './structures/Message';
export * from './structures/MessageComponentInteraction';
export * from './structures/MessageContextMenuCommandInteraction';
export * from './structures/ModalSubmitFields';
export * from './structures/ModalSubmitInteraction';
export * from './structures/PartialInteractionChannel';
export * from './structures/PartialInteractionGuild';
export * from './structures/ResolvedGuildMember';
export * from './structures/User';
export * from './structures/UserContextMenuCommandInteraction';
