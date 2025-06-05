import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';
import { APIModalSubmitInteraction, ModalSubmitActionRowComponent } from 'discord-api-types/v10';

class ModalSubmitInteraction extends BaseInteraction {
    customId: string;
    components: ModalSubmitActionRowComponent[];

    constructor(client: Client, data: APIModalSubmitInteraction) {
        super(client, data);

        this.customId = data.data.custom_id;

        this.components = data.data.components;
    }
}

export { ModalSubmitInteraction };