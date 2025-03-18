import {
    APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { CommandInteraction, CommandInteractionOption } from './CommandInteraction';
import Client from '../client/client';
import { CommandInteractionOptionResolver } from './CommandInteractionOptionResolver';

// Represents an option of a received chat input command interaction.
class ChatInputCommandInteraction extends CommandInteraction {
	options?: CommandInteractionOptionResolver;

	constructor(client: Client, data: APIChatInputApplicationCommandInteraction) {
		super(client, data);

        // The options of the command
		this.options = new CommandInteractionOptionResolver((data.data.options ?? []).map(option => this.transformOption(option, data.data.resolved)), data.data.resolved);
	}
}


export { ChatInputCommandInteraction };