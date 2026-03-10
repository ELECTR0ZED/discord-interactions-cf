import { ComponentType, APIMessageComponent } from 'discord-api-types/v10';

export function extractInteractiveComponents(component: APIMessageComponent): APIMessageComponent[] {
    switch (component.type) {
        case ComponentType.ActionRow:
        return component.components;
        case ComponentType.Section:
        return [...component.components, component.accessory];
        case ComponentType.Container:
        return component.components.flatMap(extractInteractiveComponents);
        default:
        return [component];
    }
}