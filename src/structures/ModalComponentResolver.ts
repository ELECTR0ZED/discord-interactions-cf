import Client from "../client/client";
import { Base } from "./Base";
import { APIRole, ChannelType, ComponentType } from 'discord-api-types/v10';
import { Attachment } from "./Attachment";
import { User } from "./User";
import { ResolvedGuildMember } from "./ResolvedGuildMember";
import { ResolvedData } from "../utils/util";
import { ChannelSelectMenuModalData, CheckboxGroupModalData, CheckboxModalData, FileUploadModalData, LabelModalData, MentionableSelectMenuModalData, ModalData, ModalDataWithCustomId, RadioGroupModalData, RoleSelectMenuModalData, SelectMenuModalData, TextDisplayModalData, TextInputModalData, UserSelectMenuModalData } from "./ModalSubmitInteraction";

interface ModalSelectedMentionables {
	users: Map<string, User>;
	members: Map<string, ResolvedGuildMember>;
	roles: Map<string, APIRole>;
}

class ModalComponentResolver extends Base {
	data: LabelModalData[];
	hoistedComponents: Map<string, ModalDataWithCustomId>;

	constructor(client: Client, components: LabelModalData[]) {
		super(client);

		/**
		 * The components within the modal
		 */
		this.data = components;

		/**
		 * The bottom-level components of the interaction
		 */
		this.hoistedComponents = components.reduce((accumulator: Map<string, ModalDataWithCustomId>, next: LabelModalData) => {
			const component = next.component;

			if (this.hasCustomId(component)) {
				accumulator.set(component.customId, component);
			}

			return accumulator;
		}, new Map<string, ModalDataWithCustomId>());
	}

	private hasCustomId(component: ModalData): component is ModalDataWithCustomId {
		return 'customId' in component;
	}

	/**
	 * Gets a component by custom id.
	 */
	getComponent<T extends ModalDataWithCustomId>(customId: string): T {
		const component = this.hoistedComponents.get(customId);

		if (!component) throw new Error(`No component found for custom id ${customId}`);

		return component as T;
	}

	/**
	 * Gets a component by custom id and property and checks its type.
	 */
	_getTypedComponent<T extends ModalDataWithCustomId>(customId: string, allowedTypes: ComponentType[]): T {
		const component = this.getComponent<T>(customId);

		if (!allowedTypes.includes(component.type)) {
			throw new Error(`Component with custom id ${customId} is not of type(s) ${allowedTypes.join(', ')}`);
		}

		return component as T;
	}

	/**
	 * Gets the value of a text input component
	 *
	 * @param {string} customId The custom id of the text input component
	 * @returns {string}
	 */
	getTextInputValue(customId: string): string {
		return this._getTypedComponent<TextInputModalData>(customId, [ComponentType.TextInput]).value;
	}

	/**
	 * Gets the values of a string select component
	 *
	 * @param {string} customId The custom id of the string select component
	 * @returns {string[]}
	 */
	getStringSelectValues(customId: string): string[] {
		return this._getTypedComponent<SelectMenuModalData>(customId, [ComponentType.StringSelect]).values;
	}

	/**
	 * Gets users component
	 */
	getSelectedUsers(customId: string) {
		const component = this._getTypedComponent<UserSelectMenuModalData>(
			customId,
			[ComponentType.UserSelect, ComponentType.MentionableSelect],
		);
		return component.users;
	}

	/**
	 * Gets roles component
	 */
	getSelectedRoles(customId: string) {
		const component = this._getTypedComponent<RoleSelectMenuModalData>(
			customId,
			[ComponentType.RoleSelect, ComponentType.MentionableSelect],
		);

		return component.roles;
	}

	/**
	 * Gets channels component
	 */
	getSelectedChannels(customId: string, channelTypes: ChannelType[] = []) {
		const component = this._getTypedComponent<ChannelSelectMenuModalData>(customId, [ComponentType.ChannelSelect]);
		const channels = component.channels;
		if (channels && channelTypes.length > 0) {
			for (const channel of channels.values()) {
				if (!channelTypes.includes(channel.type)) {
					throw new Error(`Channel with id ${channel.id} is not of type(s) ${channelTypes.join(', ')}`);
				}
			}
		}

		return channels;
	}

	/**
	 * Gets members component
	 */
	getSelectedMembers(customId: string) {
		const component = this._getTypedComponent<UserSelectMenuModalData>(
			customId,
			[ComponentType.UserSelect, ComponentType.MentionableSelect],
		);

		return component.members;
	}

	/**
	 * Gets mentionables component
	 */
	getSelectedMentionables(customId: string): ModalSelectedMentionables {
		const component = this._getTypedComponent<MentionableSelectMenuModalData>(
			customId,
			[ComponentType.MentionableSelect],
		);

		return {
			users: component.users,
			members: component.members,
			roles: component.roles,
		}
	}

	/**
	 * Gets file upload component
	 */
	getUploadedFiles(customId: string): Map<string, Attachment> {
		return this._getTypedComponent<FileUploadModalData>(customId, [ComponentType.FileUpload]).attachments;
	}

	/**
	 * Get radio group component
	 */
	getRadioGroup(customId: string): string | null {
		return this._getTypedComponent<RadioGroupModalData>(customId, [ComponentType.RadioGroup]).value;
	}

	/**
	 * Get checkbox group component
	 */
	getCheckboxGroup(customId: string): string[] {
		return this._getTypedComponent<CheckboxGroupModalData>(customId, [ComponentType.CheckboxGroup]).values;
	}

	/**
	 * Get checkbox component
	 */
	getCheckbox(customId: string): boolean {
		return this._getTypedComponent<CheckboxModalData>(customId, [ComponentType.Checkbox]).value;
	}
}

export { ModalComponentResolver };