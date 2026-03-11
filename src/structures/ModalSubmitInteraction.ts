import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';
import {
    APIModalSubmitInteraction,
    APIModalSubmissionComponent,
    ComponentType,
    APIInteractionDataResolved,
    APIRole,
    APIInteractionDataResolvedChannel,
    ModalSubmitLabelComponent,
    APIModalSubmitTextInputComponent,
    ModalSubmitComponent,
} from 'discord-api-types/v10';
import { User } from './User';
import { Attachment } from './Attachment';
import { ResolvedGuildMember } from './ResolvedGuildMember';
import { ModalComponentResolver } from './ModalComponentResolver';
import { transformResolved } from '../utils/util';

export interface BaseModalData {
    type: ComponentType;
    id?: number;
}

export interface SelectMenuModalData extends BaseModalData {
    type: ComponentType.StringSelect | ComponentType.UserSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect | ComponentType.ChannelSelect;
    customId: string;
    values: string[];
    members: Map<string, ResolvedGuildMember>;
    users: Map<string, User>;
    roles: Map<string, APIRole>;
    channels: Map<string, APIInteractionDataResolvedChannel>;
}

export interface FileUploadModalData extends BaseModalData {
    type: ComponentType.FileUpload;
    customId: string;
    values: string[];
    attachments: Map<string, Attachment>;
}

export interface RadioGroupModalData extends BaseModalData {
    type: ComponentType.RadioGroup;
    customId: string;
    value: string;
}

export interface CheckboxGroupModalData extends BaseModalData {
    type: ComponentType.CheckboxGroup;
    customId: string;
    values: string[];
}

export interface CheckboxModalData extends BaseModalData {
    type: ComponentType.Checkbox;
    customId: string;
    value: boolean;
}

export interface TextInputModalData extends BaseModalData {
    type: ComponentType.TextInput;
    customId: string;
    value: string;
}

export interface TextDisplayModalData extends BaseModalData {
    type: ComponentType.TextDisplay;
}

export type ModalData = SelectMenuModalData | FileUploadModalData | RadioGroupModalData | CheckboxGroupModalData | CheckboxModalData | TextInputModalData;
export type ModalComponentWithValues = SelectMenuModalData | FileUploadModalData | CheckboxGroupModalData;
export type ModalComponentWithValue = TextInputModalData | CheckboxModalData | RadioGroupModalData;

export interface LabelModalData extends BaseModalData {
    type: ComponentType.Label
    component: ModalData;
}

export type ModalDataByType = {
	[ComponentType.StringSelect]: SelectMenuModalData;
	[ComponentType.FileUpload]: FileUploadModalData;
	[ComponentType.RadioGroup]: RadioGroupModalData;
	[ComponentType.CheckboxGroup]: CheckboxGroupModalData;
	[ComponentType.Checkbox]: CheckboxModalData;
	[ComponentType.TextInput]: TextInputModalData;
	[ComponentType.TextDisplay]: TextDisplayModalData;
};

export type AnyModalDataByType = ModalDataByType[keyof ModalDataByType];

class ModalSubmitInteraction extends BaseInteraction {
    customId: string;
    components: ModalComponentResolver;

    constructor(client: Client, data: APIModalSubmitInteraction) {
        super(client, data);

        this.customId = data.data.custom_id;

        this.components = new ModalComponentResolver(
            this.client,
            data.data.components.map(component => this.transformComponent(component, data.data.resolved)) as LabelModalData[],
            transformResolved(client, this.guild, data.data.resolved),
        );
    }

    transformComponent(
        rawComponent: APIModalSubmissionComponent|APIModalSubmitTextInputComponent|ModalSubmitComponent,
        resolved?: APIInteractionDataResolved
    ): LabelModalData | ModalData {
        if ('component' in rawComponent) {
            rawComponent = rawComponent as ModalSubmitLabelComponent;
            return {
                type: rawComponent.type,
                id: rawComponent.id,
                component: this.transformComponent(rawComponent.component, resolved),
            } as LabelModalData;
        }

        rawComponent = rawComponent as ModalSubmitComponent;

        let data = {
            type: rawComponent.type,
            id: rawComponent.id,
        } as ModalData;

        if ('custom_id' in rawComponent) data.customId = rawComponent.custom_id as string;
        
        if ('value' in rawComponent) {
            data = data as ModalComponentWithValue;
            data.value = rawComponent.value as string | boolean;
        }

        if ('values' in rawComponent && rawComponent.values) {
            data = data as ModalComponentWithValues;
            data.values = rawComponent.values;
            if (resolved) {
                const { members, users, channels, roles, attachments } = resolved;
                const valueSet = new Set(rawComponent.values);

                if (rawComponent.type === ComponentType.StringSelect) {
                    const select = data as SelectMenuModalData;

                    if (users) {
                        select.users = new Map();

                        for (const [id, user] of Object.entries(users)) {
                            if (valueSet.has(id)) {
                                select.users.set(id, new User(this.client, user));
                            }
                        }
                    }

                    if (channels) {
                        select.channels = new Map();

                        for (const [id, apiChannel] of Object.entries(channels)) {
                            if (valueSet.has(id)) {
                                select.channels.set(id, apiChannel);
                            }
                        }
                    }

                    if (members) {
                        select.members = new Map();

                        for (const [id, member] of Object.entries(members)) {
                            if (valueSet.has(id)) {
                                const user = select.users.get(id);
                                if (!user) throw new Error(`User is missing when resolving member in modal submit interaction`);
                                select.members.set(id, new ResolvedGuildMember(this.client, member, user, this.guild!));
                            }
                        }
                    }

                    if (roles) {
                        select.roles = new Map();

                        for (const [id, role] of Object.entries(roles)) {
                            if (valueSet.has(id)) {
                                select.roles.set(id, role);
                            }
                        }
                    }

                    return select;
                }

                if (rawComponent.type === ComponentType.FileUpload) {
                    const fileUpload = data as FileUploadModalData;
                    if (attachments) {
                        fileUpload.attachments = new Map();
                        
                        for (const [id, attachment] of Object.entries(attachments)) {
                            if (valueSet.has(id)) {
                                fileUpload.attachments.set(id, new Attachment(attachment));
                            }
                        }
                    }

                    return fileUpload;
                }
            }
        }

        return data;
    }
}

export { ModalSubmitInteraction };