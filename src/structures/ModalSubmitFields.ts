import { ComponentType } from 'discord-api-types/v10';
import { ActionRowModalData, ModalData } from './ModalSubmitInteraction';

class ModalSubmitFields {
    components: ActionRowModalData[];
    fields: Map<string, ModalData>;

    constructor(components: ActionRowModalData[]) {
        this.components = components;

        this.fields = components.reduce((accumulator, next) => {
            for (const component of next.components) {
                accumulator.set(component.customId, component);
            }

            return accumulator;
        }, new Map());
    }

    getField(customId: string, type: ComponentType): ModalData | null {
        const field = this.fields.get(customId);
        if (!field) return null;

        if (type !== undefined && type !== field.type) {
            return null;
        }

        return field;
    }

    getTextInputValue(customId: string): string | undefined {
        return this.getField(customId, ComponentType.TextInput)?.value;
    }
}

export { ModalSubmitFields };