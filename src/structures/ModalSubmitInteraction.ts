import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';
import { APIModalSubmitInteraction, ModalSubmitActionRowComponent, ModalSubmitComponent, ComponentType } from 'discord-api-types/v10';
import { ModalSubmitFields } from './ModalSubmitFields';

export type ModalData = {
    value: string,
    type: ComponentType,
    customId: string,
}

export type ActionRowModalData = {
    type: ComponentType,
    components: ModalData[],
}

class ModalSubmitInteraction extends BaseInteraction {
    customId: string;
    components: ActionRowModalData[];
    fields: ModalSubmitFields;

    constructor(client: Client, data: APIModalSubmitInteraction) {
        super(client, data);

        this.customId = data.data.custom_id;

        this.components = data.data.components?.map(component => ModalSubmitInteraction.transformComponent(component)) as ActionRowModalData[];

        this.fields = new ModalSubmitFields(this.components);
    }

    static transformComponent(rawComponent: ModalSubmitActionRowComponent|ModalSubmitComponent): ActionRowModalData | ModalData {
        if ('components' in rawComponent && rawComponent.components) {
            rawComponent = rawComponent as ModalSubmitActionRowComponent;
            return {
                type: rawComponent.type,
                components: rawComponent.components.map(component =>
                    ModalSubmitInteraction.transformComponent(component) as ModalData
                ),
            };
        } else {
            rawComponent = rawComponent as ModalSubmitComponent;
            return {
                value: rawComponent.value,
                type: rawComponent.type,
                customId: rawComponent.custom_id,
            };
        }
    }
}

export { ModalSubmitInteraction };