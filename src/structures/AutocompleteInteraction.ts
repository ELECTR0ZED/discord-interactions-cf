import {
    APIApplicationCommandAutocompleteInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	APIApplicationCommandAutocompleteResponse,
	APIApplicationCommandOptionChoice,
} from 'discord-api-types/v10';
import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';
import { CommandInteractionOptionResolver } from './CommandInteractionOptionResolver';

class AutocompleteInteraction extends BaseInteraction {
	commandId: string;
	commandName: string;
	commandType: ApplicationCommandType;
	commandGuildId?: string;
    options: CommandInteractionOptionResolver;

	constructor(client: Client, data: APIApplicationCommandAutocompleteInteraction) {
		super(client, data);

		// The invoked application command's id
		this.commandId = data.data.id;

		// The invoked application command's name
		this.commandName = data.data.name;

		// The invoked application command's type
		this.commandType = data.data.type;

		// The id of the guild the invoked application command is registered to
		this.commandGuildId = data.data.guild_id;

        // The options of the command
		this.options = new CommandInteractionOptionResolver((data.data.options ?? []).map(option => this.transformOption(option, data.data.resolved)), data.data.resolved);
	}

	async respond(choices: APIApplicationCommandOptionChoice[]) {
		this.response = {
			type: InteractionResponseType.ApplicationCommandAutocompleteResult,
			data: {
				choices: choices
			}
		} as APIApplicationCommandAutocompleteResponse
	}
}


export { AutocompleteInteraction };