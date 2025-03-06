import { APIRole, APIRoleTags } from 'discord-api-types/v10';
import Client from '../client/client.js';
import { Base } from './Base.js';
import { PartialGuild } from './PartialGuild.js';
import { roleMention } from '@discordjs/formatters';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { RoleFlagsBitField, PermissionsBitField } from 'discord.js';
import { ImageURLOptions } from '@discordjs/rest';

// Represents a role on Discord.
class Role extends Base {
    guild: PartialGuild;
    id: APIRole['id'];
    name: APIRole['name'];
    color: APIRole['color'];
    hoist: APIRole['hoist'];
    rawPosition: APIRole['position'];
    permissions: PermissionsBitField;
    managed: APIRole['managed'];
    mentionable: APIRole['mentionable'];
    icon: APIRole['icon'];
    unicodeEmoji: APIRole['unicode_emoji'];
    flags: RoleFlagsBitField;
    tags?: {
        botId?: APIRoleTags['bot_id'];
        integrationId?: APIRoleTags['integration_id'];
        premiumSubscriberRole?: boolean;
        subscriptionListingId?: APIRoleTags['subscription_listing_id'];
        availableForPurchase?: boolean;
        guildConnections?: boolean;
    }

    constructor(client: Client, data: APIRole, guild: PartialGuild) {
        super(client);

        // The guild that the role belongs to
        this.guild = guild;

        // The role's id (unique to the guild it is part of)
        this.id = data.id;

        // The name of the role
        this.name = data.name;

        // The base 10 color of the role
        this.color = data.color;

        // If true, users that are part of this role will appear in a separate category in the users list
        this.hoist = data.hoist;

        // The raw position of the role from the API
        this.rawPosition = data.position;

        // The permissions of the role
        this.permissions = new PermissionsBitField(BigInt(data.permissions)).freeze();

        // Whether or not the role is managed by an external service
        this.managed = data.managed;

        // Whether or not the role can be mentioned by anyone
        this.mentionable = data.mentionable;

        this.icon = data.icon;

        this.unicodeEmoji = data.unicode_emoji;

        if ('flags' in data) {
            // The flags of this role
            this.flags = new RoleFlagsBitField(data.flags).freeze();
        } else {
            this.flags ??= new RoleFlagsBitField().freeze();
        }

        /**
         * The tags this role has
         */
        this.tags = {};
        if (data.tags) {
            if ('bot_id' in data.tags) {
                this.tags.botId = data.tags.bot_id;
            }
            if ('integration_id' in data.tags) {
                this.tags.integrationId = data.tags.integration_id;
            }
            if ('premium_subscriber' in data.tags) {
                this.tags.premiumSubscriberRole = true;
            }
            if ('subscription_listing_id' in data.tags) {
                this.tags.subscriptionListingId = data.tags.subscription_listing_id;
            }
            if ('available_for_purchase' in data.tags) {
                this.tags.availableForPurchase = true;
            }
            if ('guild_connections' in data.tags) {
                this.tags.guildConnections = true;
            }
        }
    }

    // The timestamp the role was created at
    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    // The time the role was created at
    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    // The hexadecimal version of the role color, with a leading hashtag
    get hexColor() {
        return `#${this.color.toString(16).padStart(6, '0')}`;
    }

    // A link to the role's icon
    iconURL(options: ImageURLOptions = {}) {
        return this.icon && this.client.rest.cdn.roleIcon(this.id, this.icon, options);
    }

    // When concatenated with a string, this automatically returns the role's mention instead of the Role object.
    toString() {
        if (this.id === this.guild.id) return '@everyone';
        return roleMention(this.id);
    }
}

export { Role };