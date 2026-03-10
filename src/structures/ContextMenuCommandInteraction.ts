import {
	APIContextMenuInteraction,
} from 'discord-api-types/v10';
import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';


// Represents an option of a received context menu command interaction.
class ContextMenuCommandInteraction extends BaseInteraction {
	targetId: APIContextMenuInteraction['data']['target_id'];

	constructor(client: Client, data: APIContextMenuInteraction) {
		super(client, data);

        this.targetId = data.data.target_id;
	}
}


export { ContextMenuCommandInteraction };