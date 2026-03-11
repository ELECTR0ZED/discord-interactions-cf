import { APIInteractionDataResolved, APIInteractionDataResolvedChannel, APIRole } from "discord-api-types/v10";
import { User } from "../structures/User";
import { Attachment } from "../structures/Attachment";
import { ResolvedGuildMember } from "../structures/ResolvedGuildMember";
import Client from "../client/client";
import { PartialInteractionGuild } from "../structures/PartialInteractionGuild";

export interface ResolvedData {
	users: Map<string, User>;
	members: Map<string, ResolvedGuildMember>;
	roles: Map<string, APIRole>;
	channels: Map<string, APIInteractionDataResolvedChannel>;
	attachments: Map<string, Attachment>;
}

export function transformResolved(
	client: Client,
	guild?: PartialInteractionGuild,
	{ members, users, channels, roles, attachments }: APIInteractionDataResolved = {},
): ResolvedData {
	const result: ResolvedData = {
		users: new Map<string, User>(),
		members: new Map<string, ResolvedGuildMember>(),
		roles: new Map<string, APIRole>(),
		channels: new Map<string, APIInteractionDataResolvedChannel>(),
		attachments: new Map<string, Attachment>(),
	};

	if (users) {
		for (const user of Object.values(users)) {
			result.users.set(user.id, new User(client, user));
		}
	}

	if (members) {
		for (const [id, member] of Object.entries(members)) {
			const user = result.users.get(id);
			if (!user) throw new Error(`User is missing when resolving member in modal submit interaction`);
			if (!guild) throw new Error(`Guild is missing when resolving member in modal submit interaction`);
			result.members.set(id, new ResolvedGuildMember(client, member, user, guild));
		}
	}

	if (roles) {
		for (const role of Object.values(roles)) {
			result.roles.set(role.id, role);
		}
	}

	if (channels) {
		for (const apiChannel of Object.values(channels)) {
			result.channels.set(apiChannel.id, apiChannel);
		}
	}

	if (attachments) {
		for (const attachment of Object.values(attachments)) {
			result.attachments.set(attachment.id, new Attachment(attachment));
		}
	}

	return result;
}