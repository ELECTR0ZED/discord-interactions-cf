import { DiscordSnowflake } from '@sapphire/snowflake';
import {
    APIBaseInteraction,
    InteractionType,
    APIEntitlement,
    APIPartialInteractionGuild,
    APIPartialGuild,
} from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import { Base } from './Base';
import Client from '../client/client';
import { PartialGuild } from './PartialGuild';
import { PartialChannel } from './PartialChannel';

type APIBaseInteractionComplete = APIBaseInteraction<InteractionType, any>;

class BaseInteraction extends Base {
    id: APIBaseInteractionComplete['id'];
    type: APIBaseInteractionComplete['type'];
    readonly token: APIBaseInteractionComplete['token'];
    applicationId: APIBaseInteractionComplete['application_id'];
    channel: PartialChannel | APIBaseInteractionComplete['channel'];
    guildId: APIBaseInteractionComplete['guild_id'];
    guild?: PartialGuild | APIPartialInteractionGuild;
    user: APIBaseInteractionComplete['user'];
    member: APIBaseInteractionComplete['member'];
    version: APIBaseInteractionComplete['version'];
    appPermissions: PermissionsBitField;
    memberPermissions?: PermissionsBitField;
    locale: APIBaseInteractionComplete['locale'];
    guildLocale: APIBaseInteractionComplete['guild_locale'];
    entitlements: Map<APIEntitlement['id'], APIEntitlement>;
    authorizingIntegrationOwners: APIBaseInteractionComplete['authorizing_integration_owners'];
    context: APIBaseInteractionComplete['context'];

    constructor(client: Client, data: APIBaseInteractionComplete) {
        super(client);

        // The interactions ID
        this.id = data.id;

        // The type of interaction
        this.type = data.type;

        // The token of the interaction
        this.token = data.token;

        // The application ID of the interaction
        this.applicationId = data.application_id;

        // The channel the interaction was sent in
        this.channel = data.channel ? new PartialChannel(this.client, data.channel) : undefined;

        // The guild id the interaction was sent in
        this.guildId = data.guild_id;

        // The guild the interaction was sent in
        this.guild = data.guild ? new PartialGuild(this.client, data.guild as unknown as APIPartialGuild) : undefined;

        // The user that sent the interaction
        this.user = data.user;

        // If the interaction was sent in a guild, the member which sent it
        this.member = data.member;

        // The version
        this.version = data.version;

        // Set of permissions the bot has in the channel the interaction was sent in
        this.appPermissions = new PermissionsBitField(BigInt(data.app_permissions)).freeze();

        // The permissions of the member, if exists in a guild
        this.memberPermissions = data.member?.permissions
            ? new PermissionsBitField(BigInt(data.member.permissions)).freeze()
            : undefined;
            
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

    // Indicates whether this interaction is received from a guild.
    inGuild() {
        return Boolean(this.guildId && this.member);
    }
}

export { BaseInteraction };