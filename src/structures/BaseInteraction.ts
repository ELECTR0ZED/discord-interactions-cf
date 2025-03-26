import { DiscordSnowflake } from '@sapphire/snowflake';
import {
    APIBaseInteraction,
    InteractionType,
    APIEntitlement,
    InteractionResponseType,
    Routes,
    APIInteractionResponse,
} from 'discord-api-types/v10';
import { Base } from './Base';
import Client from '../client/client';
import { PartialInteractionGuild } from './PartialInteractionGuild';
import { PartialInteractionChannel } from './PartialInteractionChannel';
import { InteractionGuildMember } from './InteractionGuildMember';
import { User } from './User';
import { InteractionResponseCallback, InteractionResponseCallbackOptions } from './InteractionResponseCallback';
import { Message } from './Message';

type APIBaseInteractionComplete = APIBaseInteraction<InteractionType, any>;

class BaseInteraction extends Base {
    id: APIBaseInteractionComplete['id'];
    applicationId: APIBaseInteractionComplete['application_id'];
    type: APIBaseInteractionComplete['type'];
    data: APIBaseInteractionComplete['data'];
    guild?: PartialInteractionGuild;
    guildId: APIBaseInteractionComplete['guild_id'];
    channel?: PartialInteractionChannel;
    member?: InteractionGuildMember;
    user?: User;
    readonly token: APIBaseInteractionComplete['token'];
    version: APIBaseInteractionComplete['version'];
    message?: Message;
    appPermissions: APIBaseInteractionComplete['app_permissions'];
    locale: APIBaseInteractionComplete['locale'];
    guildLocale: APIBaseInteractionComplete['guild_locale'];
    entitlements: Map<APIEntitlement['id'], APIEntitlement>;
    authorizingIntegrationOwners: APIBaseInteractionComplete['authorizing_integration_owners'];
    context: APIBaseInteractionComplete['context'];
	response: APIInteractionResponse | null;

    constructor(client: Client, data: APIBaseInteractionComplete) {
        super(client);

        // The interactions ID
        this.id = data.id;

        // The application ID of the interaction
        this.applicationId = data.application_id;

        // The type of interaction
        this.type = data.type;

        // The command data payload
        this.data = data.data;

        // The guild the interaction was sent in
        this.guild = data.guild ? new PartialInteractionGuild(this.client, data.guild) : undefined;

        // The guild id the interaction was sent in
        this.guildId = data.guild_id;

        // The channel the interaction was sent in
        this.channel = data.channel ? new PartialInteractionChannel(this.client, data.channel) : undefined;

        // If the interaction was sent in a guild, the member which sent it
        if (data.member && this.guild) {
            this.member = new InteractionGuildMember(this.client, data.member, this.guild);
        }

        // The user that sent the interaction
        if (data.user || data.member?.user) {
            this.user = new User(this.client, data.user ?? data.member?.user!);
        }

        // The token of the interaction
        this.token = data.token;

        // The version
        this.version = data.version;

        // For components, the message they were attached to
        this.message = data.message ? new Message(this.client, data.message) : undefined;

        // Set of permissions the bot has in the channel the interaction was sent in
        this.appPermissions = data.app_permissions;

        // The locale of the user who sent the interaction
        this.locale = data.locale;

        // The locale of the guild the interaction was sent in
        this.guildLocale = data.guild_locale;

        // The entitlements the user has
        this.entitlements = data.entitlements.reduce(
            (coll, entitlement) => coll.set(entitlement.id, entitlement),
            new Map(),
        );

        // Mapping of installation contexts that the interaction was authroized for the related user or guild ids
        this.authorizingIntegrationOwners = data.authorizing_integration_owners;

        // Context where the interaction was triggered from
        this.context = data.context;
        
		this.response = null;
    }

    //The timestamp the interaction was created at
    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    // The time the interaction was created at
    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    async reply(options: InteractionResponseCallbackOptions) {
		this.response = {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: new InteractionResponseCallback(options).toJSON(),
		}
	}

	async deferReply(options: InteractionResponseCallbackOptions) {
		this.response = {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: new InteractionResponseCallback(options).toJSON(),
		}
	}

	async followUp(options: InteractionResponseCallbackOptions) {
		await this.client.rest.post(
            Routes.webhook(this.applicationId, this.token),
            {
				body: new InteractionResponseCallback(options).toJSON(),
			},
        );
	}

	async editReply(options: InteractionResponseCallbackOptions) {
		await this.client.rest.patch(
			Routes.webhookMessage(this.applicationId, this.token, '@original'),
			{
				body: new InteractionResponseCallback(options).toJSON(),
			},
		);
	}

	async deleteReply() {
		await this.client.rest.delete(
			Routes.webhookMessage(this.applicationId, this.token, '@original'),
		);
	}

    async deferUpdate() {
        this.response = {
            type: InteractionResponseType.DeferredMessageUpdate,
        };
    }

    async update(options: InteractionResponseCallbackOptions) {
        this.response = {
            type: InteractionResponseType.UpdateMessage,
            data: new InteractionResponseCallback(options).toJSON(),
        };
    }
}

export { BaseInteraction };