import {
    InteractionType,
    APIInteraction,
    ApplicationCommandType,
    APIChatInputApplicationCommandInteraction,
    APIUserApplicationCommandInteraction,
    APIMessageApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
 } from 'discord-api-types/v10';
import Client from '../client/client';
import { ChatInputCommandInteraction } from '../structures/ChatInputCommandInteraction';
import { UserContextMenuCommandInteraction } from '../structures/UserContextMenuCommandInteraction';
import { MessageContextMenuCommandInteraction } from '../structures/MessageContextMenuCommandInteraction';
import { MessageComponentInteraction } from '../structures/MessageComponentInteraction';
import { AutocompleteInteraction } from '../structures/AutocompleteInteraction';
import { ModalSubmitInteraction } from '../structures/ModalSubmitInteraction';

export function createInteraction(
    client: Client,
    interaction: APIInteraction
):
    | ChatInputCommandInteraction
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction
    | MessageComponentInteraction
    | AutocompleteInteraction
    | ModalSubmitInteraction
    | null {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand:
            switch (interaction.data.type) {
                case ApplicationCommandType.ChatInput:
                    return new ChatInputCommandInteraction(client, interaction as APIChatInputApplicationCommandInteraction);
                case ApplicationCommandType.User:
                    return new UserContextMenuCommandInteraction(client, interaction as APIUserApplicationCommandInteraction);
                case ApplicationCommandType.Message:
                    return new MessageContextMenuCommandInteraction(client, interaction as APIMessageApplicationCommandInteraction);
                default:
                    console.error('Unknown command type:', interaction.data.type);
                    return null;
            }

        case InteractionType.MessageComponent:
            return new MessageComponentInteraction(client, interaction as APIMessageComponentInteraction);

        case InteractionType.ApplicationCommandAutocomplete:
            return new AutocompleteInteraction(client, interaction as APIApplicationCommandAutocompleteInteraction);

        case InteractionType.ModalSubmit:
            return new ModalSubmitInteraction(client, interaction as APIModalSubmitInteraction);

        default:
            console.error('Unknown interaction type:', interaction.type);
            return null;
    }
}