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
import { ResolvedData, transformResolved } from '../utils/util';

export interface BaseModalData {
    type: ComponentType;
    id?: number;
}

export type SelectMenuModalType = 
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;

export interface BaseSelectMenuModalData extends BaseModalData {
    type: SelectMenuModalType;
    customId: string;
    values: string[];
}

export interface StringSelectMenuModalData extends BaseSelectMenuModalData {
    type: ComponentType.StringSelect;
}

export interface UserSelectMenuModalData extends BaseSelectMenuModalData {
    type: ComponentType.UserSelect;
    users: Map<string, User>;
    members: Map<string, ResolvedGuildMember>;
}

export interface RoleSelectMenuModalData extends BaseSelectMenuModalData {
    type: ComponentType.RoleSelect;
    roles: Map<string, APIRole>;
}

export interface MentionableSelectMenuModalData extends BaseSelectMenuModalData {
    type: ComponentType.MentionableSelect;
    members: Map<string, ResolvedGuildMember>;
    users: Map<string, User>;
    roles: Map<string, APIRole>;
    channels: Map<string, APIInteractionDataResolvedChannel>;
}

export interface ChannelSelectMenuModalData extends BaseSelectMenuModalData {
    type: ComponentType.ChannelSelect;
    channels: Map<string, APIInteractionDataResolvedChannel>;
}

export type SelectMenuModalData =
    | StringSelectMenuModalData
    | UserSelectMenuModalData
    | RoleSelectMenuModalData
    | MentionableSelectMenuModalData
    | ChannelSelectMenuModalData;

export interface FileUploadModalData extends BaseModalData {
    type: ComponentType.FileUpload;
    customId: string;
    values: string[];
    attachments: Map<string, Attachment>;
}

export interface RadioGroupModalData extends BaseModalData {
    type: ComponentType.RadioGroup;
    customId: string;
    value: string | null;
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

export type ModalData = SelectMenuModalData | FileUploadModalData | RadioGroupModalData | CheckboxGroupModalData | CheckboxModalData | TextInputModalData | TextDisplayModalData;
export type ModalDataWithCustomId = Exclude<ModalData, TextDisplayModalData>;
export type ModalComponentWithValues = SelectMenuModalData | FileUploadModalData | CheckboxGroupModalData;
export type ModalComponentWithValue = TextInputModalData | CheckboxModalData | RadioGroupModalData;

export interface LabelModalData extends BaseModalData {
    type: ComponentType.Label
    component: ModalData;
}

export type ModalDataByType = {
	[ComponentType.StringSelect]: StringSelectMenuModalData;
    [ComponentType.UserSelect]: UserSelectMenuModalData;
    [ComponentType.RoleSelect]: RoleSelectMenuModalData;
    [ComponentType.MentionableSelect]: MentionableSelectMenuModalData;
    [ComponentType.ChannelSelect]: ChannelSelectMenuModalData;
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
    resolved: ResolvedData;

    constructor(client: Client, data: APIModalSubmitInteraction) {
        super(client, data);

        this.customId = data.data.custom_id;

        this.resolved = transformResolved(client, this.guild, data.data.resolved);

        this.components = new ModalComponentResolver(
            this.client,
            data.data.components.map(component => this.transformComponent(component, data.data.resolved)) as LabelModalData[],
            this.resolved,
        );
    }

    transformComponent(
        rawComponent: APIModalSubmissionComponent|APIModalSubmitTextInputComponent|ModalSubmitComponent,
        resolved?: APIInteractionDataResolved
    ): LabelModalData | ModalData {
        switch (rawComponent.type) {
            case ComponentType.Label:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                    component: this.transformComponent(rawComponent.component, resolved),
                } as LabelModalData;
            case ComponentType.TextInput:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                    customId: rawComponent.custom_id,
                    value: rawComponent.value,
                };
            case ComponentType.Checkbox:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                    customId: rawComponent.custom_id,
                    value: rawComponent.value,
                };
            case ComponentType.RadioGroup:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                    customId: rawComponent.custom_id,
                    value: rawComponent.value || null,
                };
            case ComponentType.CheckboxGroup:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                    customId: rawComponent.custom_id,
                    values: rawComponent.values,
                };
            case ComponentType.StringSelect:
                return this.transformSelect<StringSelectMenuModalData>(rawComponent, resolved);
            case ComponentType.UserSelect:
                return this.transformSelect<UserSelectMenuModalData>(rawComponent, resolved);
            case ComponentType.RoleSelect:
                return this.transformSelect<RoleSelectMenuModalData>(rawComponent, resolved);
            case ComponentType.MentionableSelect:
                return this.transformSelect<MentionableSelectMenuModalData>(rawComponent, resolved);
            case ComponentType.ChannelSelect:
                return this.transformSelect<ChannelSelectMenuModalData>(rawComponent, resolved);
            case ComponentType.FileUpload:
                return this.transformFileUpload(rawComponent, resolved);
            case ComponentType.TextDisplay:
                return {
                    type: rawComponent.type,
                    id: rawComponent.id,
                };
            case ComponentType.ActionRow:
                throw new Error(`ActionRow components are deprecated in modals`);
            default: {
                const exhaustiveCheck: never = rawComponent;
                throw new Error(`Unsupported modal component type: ${(exhaustiveCheck as { type: number }).type}`);
            }
        }
    }

    private transformSelect<T extends SelectMenuModalData>(
        rawComponent:
            | Extract<ModalSubmitComponent, { type: ComponentType.StringSelect }>
            | Extract<ModalSubmitComponent, { type: ComponentType.UserSelect }>
            | Extract<ModalSubmitComponent, { type: ComponentType.RoleSelect }>
            | Extract<ModalSubmitComponent, { type: ComponentType.MentionableSelect }>
            | Extract<ModalSubmitComponent, { type: ComponentType.ChannelSelect }>,
        resolved?: APIInteractionDataResolved,
    ): T {
        const data = {
            type: rawComponent.type,
            id: rawComponent.id,
            customId: rawComponent.custom_id,
            values: rawComponent.values,
        } as SelectMenuModalData;

        if (!resolved) {
            return data as T;
        }

        const valueSet = new Set(rawComponent.values);
        const { members, users, channels, roles } = resolved;

        if (
            (rawComponent.type === ComponentType.UserSelect || rawComponent.type === ComponentType.MentionableSelect) &&
            users
        ) {
            const mappedUsers = new Map<string, User>();

            for (const [id, user] of Object.entries(users)) {
                if (valueSet.has(id)) {
                    mappedUsers.set(id, new User(this.client, user));
                }
            }

            (data as UserSelectMenuModalData | MentionableSelectMenuModalData).users = mappedUsers;
        }

        if (
            (rawComponent.type === ComponentType.ChannelSelect || rawComponent.type === ComponentType.MentionableSelect) &&
            channels
        ) {
            const mappedChannels = new Map<string, APIInteractionDataResolvedChannel>();

            for (const [id, channel] of Object.entries(channels)) {
                if (valueSet.has(id)) {
                    mappedChannels.set(id, channel);
                }
            }

            (data as ChannelSelectMenuModalData | MentionableSelectMenuModalData).channels = mappedChannels;
        }

        if (
            (rawComponent.type === ComponentType.RoleSelect || rawComponent.type === ComponentType.MentionableSelect) &&
            roles
        ) {
            const mappedRoles = new Map<string, APIRole>();

            for (const [id, role] of Object.entries(roles)) {
                if (valueSet.has(id)) {
                    mappedRoles.set(id, role);
                }
            }

            (data as RoleSelectMenuModalData | MentionableSelectMenuModalData).roles = mappedRoles;
        }

        if (
            (rawComponent.type === ComponentType.UserSelect || rawComponent.type === ComponentType.MentionableSelect) &&
            members
        ) {
            const dataWithMembers = data as UserSelectMenuModalData | MentionableSelectMenuModalData;
            dataWithMembers.members = new Map();

            for (const [id, member] of Object.entries(members)) {
                if (valueSet.has(id)) {
                    const user = dataWithMembers.users.get(id);
                    if (!user) {
                        throw new Error('User is missing when resolving member in modal submit interaction');
                    }

                    dataWithMembers.members.set(id, new ResolvedGuildMember(this.client, member, user, this.guild!));
                }
            }
        }

        return data as T;
    }


    private transformFileUpload(
        rawComponent: Extract<ModalSubmitComponent, { type: ComponentType.FileUpload }>,
        resolved?: APIInteractionDataResolved,
    ): FileUploadModalData {
        const data: FileUploadModalData = {
            type: rawComponent.type,
            id: rawComponent.id,
            customId: rawComponent.custom_id,
            values: rawComponent.values,
            attachments: new Map<string, Attachment>(),
        };

        if (!resolved?.attachments) {
            return data;
        }

        const valueSet = new Set(rawComponent.values);

        for (const [id, attachment] of Object.entries(resolved.attachments)) {
            if (valueSet.has(id)) {
                data.attachments.set(id, new Attachment(attachment));
            }
        }

        return data;
    }
}

export { ModalSubmitInteraction };