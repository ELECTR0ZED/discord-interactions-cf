import {
	APIApplicationCommandInteraction,
	ApplicationCommandType,
	APIApplicationCommandOption,
	APIInteractionDataResolved,
	ApplicationCommandOptionType,
	APIGuildMember,
	APIChannel,
	APIRole,
	APIInteractionResponse,
} from 'discord-api-types/v10';
import { Attachment } from './Attachment';
import { BaseInteraction } from './BaseInteraction';
import Client from '../client/client';
import { User } from './User';
import { InteractionResponseCallback, InteractionResponseCallbackOptions } from './InteractionResponseCallback';

// Represents an option of a received command interaction.
type CommandInteractionOption = {
	name: string;
	type: ApplicationCommandOptionType;
	autocomplete?: boolean;
	value?: string;
	options?: CommandInteractionOption[];
	user?: User;
	member?: APIGuildMember;
	channel?: APIChannel;
	role?: APIRole;
	attachment?: Attachment;
};

class CommandInteraction extends BaseInteraction {
	commandId: string;
	commandName: string;
	commandType: ApplicationCommandType;
	commandGuildId?: string;

	constructor(client: Client, data: APIApplicationCommandInteraction) {
		super(client, data);

		// The invoked application command's id
		this.commandId = data.data.id;

		// The invoked application command's name
		this.commandName = data.data.name;

		// The invoked application command's type
		this.commandType = data.data.type;

		// The id of the guild the invoked application command is registered to
		this.commandGuildId = data.data.guild_id;
	}

	// Transforms an option received from the API.
	transformOption(option: APIApplicationCommandOption, resolved: APIInteractionDataResolved) {
		const result = {
			name: option.name,
			type: option.type,
		} as CommandInteractionOption;

		if ('value' in option) result.value = option.value as CommandInteractionOption['value'];
		if ('options' in option && option.options) result.options = option.options.map(opt => this.transformOption(opt, resolved));

		if (resolved) {
			// const user = resolved.users?.[option.value];
			// if (user) result.user = new User(this.client, user);

			// const member = resolved.members?.[option.value];
			// if (member) result.member = new GuildMember(this.client, member, this.guild);

			// const channel = resolved.channels?.[option.value];
			// if (channel) result.channel = new PartialChannel(this.client, channel);

			// const role = resolved.roles?.[option.value];
			// if (role) result.role = new Role(this.client, role);

			// const attachment = resolved.attachments?.[option.value];
			// if (attachment) result.attachment = new Attachment(attachment);
		}

		return result;
	}

	reply(options: InteractionResponseCallbackOptions): APIInteractionResponse {
		return {
			type: 4,
			data: new InteractionResponseCallback(options).toJSON(),
		}
	}
}


export { CommandInteraction };