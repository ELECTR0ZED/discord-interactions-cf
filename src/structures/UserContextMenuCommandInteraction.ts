import {
	APIUserApplicationCommandInteraction,
} from 'discord-api-types/v10';
import Client from '../client/client';
import { ContextMenuCommandInteraction } from './ContextMenuCommandInteraction';
import { User } from './User';

class UserContextMenuCommandInteraction extends ContextMenuCommandInteraction {
	user: User;

	constructor(client: Client, data: APIUserApplicationCommandInteraction) {
		super(client, data);

		this.user = new User(this.client, data.data.resolved.users[this.targetId]);
	}
}


export { UserContextMenuCommandInteraction };