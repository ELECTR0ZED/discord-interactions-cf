import { DiscordSnowflake } from '@sapphire/snowflake';
import {
    APIBaseInteraction,
    InteractionType,
    APIEntitlement,
} from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import { Base } from './Base';
import Client from '../client/client';
import { PartialInteractionGuild } from './PartialInteractionGuild';
import { PartialInteractionChannel } from './PartialInteractionChannel';
import { InteractionGuildMember } from './InteractionGuildMember';
import { User } from './User';

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
    message: APIBaseInteractionComplete['message'];
    appPermissions: PermissionsBitField;
    locale: APIBaseInteractionComplete['locale'];
    guildLocale: APIBaseInteractionComplete['guild_locale'];
    entitlements: Map<APIEntitlement['id'], APIEntitlement>;
    authorizingIntegrationOwners: APIBaseInteractionComplete['authorizing_integration_owners'];
    context: APIBaseInteractionComplete['context'];

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
        this.user = data.user ? new User(this.client, data.user) : undefined;

        // The token of the interaction
        this.token = data.token;

        // The version
        this.version = data.version;

        // For components, the message they were attached to
        this.message = data.message;

        // Set of permissions the bot has in the channel the interaction was sent in
        this.appPermissions = new PermissionsBitField(BigInt(data.app_permissions)).freeze();

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
    }

    //The timestamp the interaction was created at
    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    // The time the interaction was created at
    get createdAt() {
        return new Date(this.createdTimestamp);
    }
}

export { BaseInteraction };