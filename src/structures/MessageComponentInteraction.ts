import { BaseInteraction } from './BaseInteraction.js';
import Client from '../client/client';
import { APIMessageComponentInteraction } from 'discord-api-types/v10';
import { Message } from './Message.js';

// Represents a message component interaction.
class MessageComponentInteraction extends BaseInteraction {
    message: Message;
    customId: APIMessageComponentInteraction['data']['custom_id'];
    componentType: APIMessageComponentInteraction['data']['component_type'];

    constructor(client: Client, data: APIMessageComponentInteraction) {
        super(client, data);

        // The message to which the component was attached
        this.message = new Message(client, data.message);

        // The custom id of the component which was interacted with
        this.customId = data.data.custom_id;

        // The type of component which was interacted with
        this.componentType = data.data.component_type;
    }

    // The component which was interacted with
    get component() {
        return this.message.components?.flatMap(row => row.components)
        .find(component => 'custom_id' in component && component.custom_id === this.customId);
    }
}

export { MessageComponentInteraction };