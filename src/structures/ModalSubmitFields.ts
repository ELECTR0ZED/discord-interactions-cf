import { ComponentType } from 'discord-api-types/v10';
import { ActionRowModalData, ModalData, ModalDataByType } from './ModalSubmitInteraction';

class ModalSubmitFields {
    components: ActionRowModalData[];
    fields: Map<string, ModalData>;

    constructor(components: ActionRowModalData[]) {
        this.components = components;

        this.fields = components.reduce((accumulator, next) => {
            if ('components' in next) {
                for (const component of next.components) {
                    if ('customId' in component) {
                        accumulator.set(component.customId, component);
                    }
                }
            }

            if ('component' in next) {
                const component = next.component as ModalData;
                accumulator.set(component.customId, component)
            }

            return accumulator;
        }, new Map());
    }

    getField<T extends keyof ModalDataByType>(customId: string, type: T | undefined): ModalDataByType[T] | null {
        const field = this.fields.get(customId);
        if (!field) return null;

        if (type !== undefined && type !== field.type) {
            return null;
        }

        return field as ModalDataByType[T];
    }

    getTextInputValue(customId: string): string | undefined {
        return this.getField(customId, ComponentType.TextInput)?.value;
    }
}

export { ModalSubmitFields };