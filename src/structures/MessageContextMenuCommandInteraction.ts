import {
	APIMessageApplicationCommandInteraction,
} from 'discord-api-types/v10';
import Client from '../client/client';
import { ContextMenuCommandInteraction } from './ContextMenuCommandInteraction';
import { Message } from './Message';

class MessageContextMenuCommandInteraction extends ContextMenuCommandInteraction {
	message: Message;

	constructor(client: Client, data: APIMessageApplicationCommandInteraction) {
		super(client, data);

		this.message = new Message(this.client, data.data.resolved.messages[this.targetId]);
	}
}


export { MessageContextMenuCommandInteraction };