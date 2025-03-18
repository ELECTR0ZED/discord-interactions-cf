import {
    APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { CommandInteraction, CommandInteractionOption } from './CommandInteraction';
import Client from '../client/client';

// Represents an option of a received chat input command interaction.
class ChatInputCommandInteraction extends CommandInteraction {
	options?: CommandInteractionOption[];

	constructor(client: Client, data: APIChatInputApplicationCommandInteraction) {
		super(client, data);

        // The options of the command
        this.options = data.data.options?.map(option => this.transformOption(option, data.data.resolved))
	}
}


export { ChatInputCommandInteraction };