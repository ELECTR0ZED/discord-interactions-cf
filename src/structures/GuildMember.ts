import { APIGuildMember } from "discord-api-types/v10";
import Client from "../client/client";
import { PartialGuild } from "./PartialGuild";
import { GuildMemberFlagsBitField } from 'discord.js';
import { Base } from './Base.js';
import { ImageURLOptions } from '@discordjs/rest';
import { User } from './User';

// Represents a member of a guild on Discord.
class GuildMember extends Base {
    guild: PartialGuild;
    joinedTimestamp: number | null;
    premiumSinceTimestamp: number | null;
    nickname: APIGuildMember['nick'];
    communicationDisabledUntilTimestamp: number | null;
    roles?: APIGuildMember['roles'];
    user: User;
    avatar?: APIGuildMember['avatar'];
    banner?: APIGuildMember['banner'];
    pending: APIGuildMember['pending'] | null;
    flags?: GuildMemberFlagsBitField;

    constructor(client: Client, data: APIGuildMember, guild: PartialGuild) {
        super(client);

        // The guild that this member is part of
        this.guild = guild;

        // The timestamp the member joined the guild at
        this.joinedTimestamp = null;

        // The last timestamp this member started boosting the guild
        this.premiumSinceTimestamp = null;

        // The nickname of this member, if they have one
        this.nickname = null;

        // Whether this member has yet to pass the guild's membership gate
        this.pending = null;

        // The timestamp this member's timeout will be removed
        this.communicationDisabledUntilTimestamp = null;

        // The role ids of the member
        this.roles = [];

        // The user that this member represents
        this.user = new User(this.client, data.user);

        if (data) this._patch(data);
    }

    _patch(data: APIGuildMember) {
        if ('nick' in data) this.nickname = data.nick;
        if ('avatar' in data) {
            // The guild member's avatar hash
            this.avatar = data.avatar;
        } else if (typeof this.avatar !== 'string') {
            this.avatar = null;
        }

        if ('banner' in data) {
            // The guild member's banner hash.
            this.banner = data.banner;
        } else {
            this.banner ??= null;
        }

        if ('joined_at' in data) this.joinedTimestamp = Date.parse(data.joined_at);
        if ('premium_since' in data) {
            this.premiumSinceTimestamp = data.premium_since ? Date.parse(data.premium_since) : null;
        }
        if ('roles' in data) this.roles = data.roles;

        if ('pending' in data) {
            this.pending = data.pending;
        } else if (!this.partial) {
            this.pending ??= false;
        }

        if ('communication_disabled_until' in data) {
            this.communicationDisabledUntilTimestamp =
                data.communication_disabled_until ? Date.parse(data.communication_disabled_until) : null;
        }

        if ('flags' in data) {
            // The flags of this member
            this.flags = new GuildMemberFlagsBitField(data.flags).freeze();
        } else {
            this.flags ??= new GuildMemberFlagsBitField().freeze();
        }
    }

    // Whether this GuildMember is a partial
    get partial() {
        return this.joinedTimestamp === null;
    }

    // A link to the member's guild avatar.
    avatarURL(options: ImageURLOptions = {}) {
        return this.avatar && this.client.rest.cdn.guildMemberAvatar(this.guild.id, this.id, this.avatar, options);
    }

    // A link to the member's banner.
    bannerURL(options: ImageURLOptions = {}) {
        return this.banner && this.client.rest.cdn.guildMemberBanner(this.guild.id, this.id, this.banner, options);
    }

    // A link to the member's guild avatar if they have one.
    displayAvatarURL(options: ImageURLOptions = {}) {
        return this.avatarURL(options) ?? this.user.displayAvatarURL(options);
    }

    // A link to the member's guild banner if they have one.
    displayBannerURL(options: ImageURLOptions = {}) {
        return this.bannerURL(options) ?? this.user.bannerURL(options);
    }

    // The time this member joined the guild
    get joinedAt() {
        return this.joinedTimestamp && new Date(this.joinedTimestamp);
    }

    // The time this member's timeout will be removed
    get communicationDisabledUntil() {
        return this.communicationDisabledUntilTimestamp && new Date(this.communicationDisabledUntilTimestamp);
    }

    // The last time this member started boosting the guild
    get premiumSince() {
        return this.premiumSinceTimestamp && new Date(this.premiumSinceTimestamp);
    }

    // The member's id
    get id() {
        return this.user.id;
    }

    // The nickname of this member, or their user display name if they don't have one
    get displayName() {
        return this.nickname ?? this.user.displayName;
    }

    // Whether this member is currently timed out
    isCommunicationDisabled() {
        return this.communicationDisabledUntilTimestamp !== null && this.communicationDisabledUntilTimestamp > Date.now();
    }

    // When concatenated with a string, this automatically returns the user's mention instead of the GuildMember object.
    toString() {
        return this.user.toString();
    }
}

export { GuildMember };