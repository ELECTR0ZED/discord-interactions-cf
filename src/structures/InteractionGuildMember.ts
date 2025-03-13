import { APIInteractionGuildMember, APIAvatarDecorationData } from "discord-api-types/v10";
import Client from "../client/client";
import { PartialInteractionGuild } from "./PartialInteractionGuild";
import { Base } from './Base.js';
import { ImageURLOptions } from '@discordjs/rest';
import { User } from './User';

// Represents a member of a guild on Discord.
class InteractionGuildMember extends Base {
    user: User;
    guild: PartialInteractionGuild;
    nickname: APIInteractionGuildMember['nick'];
    avatar: APIInteractionGuildMember['avatar'];
    banner: APIInteractionGuildMember['banner'];
    roles: APIInteractionGuildMember['roles'];
    joinedTimestamp: number;
    premiumSinceTimestamp: number | null;
    deaf: APIInteractionGuildMember['deaf'];
    mute: APIInteractionGuildMember['mute'];
    flags: APIInteractionGuildMember['flags'];
    pending: APIInteractionGuildMember['pending'];
    communicationDisabledUntilTimestamp: number | null;
    avatarDecorationData: {
        asset: APIAvatarDecorationData['asset'];
        skuId: APIAvatarDecorationData['sku_id']; 
    } | null;
    permissions: APIInteractionGuildMember['permissions'];

    constructor(client: Client, data: APIInteractionGuildMember, guild: PartialInteractionGuild) {
        super(client);

        this.user = new User(this.client, data.user);
        this.guild = guild;
        this.nickname = data.nick;
        this.avatar = data.avatar;
        this.banner = data.banner;
        this.roles = data.roles;
        this.joinedTimestamp = Date.parse(data.joined_at);
        this.premiumSinceTimestamp = data.premium_since ? Date.parse(data.premium_since) : null;
        this.deaf = data.deaf;
        this.mute = data.mute;
        this.flags = data.flags;
        this.pending = data.pending ?? false;
        this.communicationDisabledUntilTimestamp = data.communication_disabled_until ? Date.parse(data.communication_disabled_until) : null;
        this.avatarDecorationData = data.avatar_decoration_data ? {
			asset: data.avatar_decoration_data.asset,
			skuId: data.avatar_decoration_data.sku_id,
		} : null;
        this.permissions = data.permissions;
    }

    avatarURL(options: ImageURLOptions = {}) {
        return this.avatar && this.client.rest.cdn.guildMemberAvatar(this.guild.id, this.id, this.avatar, options);
    }

    bannerURL(options: ImageURLOptions = {}) {
        return this.banner && this.client.rest.cdn.guildMemberBanner(this.guild.id, this.id, this.banner, options);
    }

    displayAvatarURL(options: ImageURLOptions = {}) {
        return this.avatarURL(options) ?? this.user.displayAvatarURL(options);
    }

    displayBannerURL(options: ImageURLOptions = {}) {
        return this.bannerURL(options) ?? this.user.bannerURL(options);
    }

    get joinedAt() {
        return this.joinedTimestamp && new Date(this.joinedTimestamp);
    }

    get communicationDisabledUntil() {
        return this.communicationDisabledUntilTimestamp && new Date(this.communicationDisabledUntilTimestamp);
    }

    get premiumSince() {
        return this.premiumSinceTimestamp && new Date(this.premiumSinceTimestamp);
    }

    get id() {
        return this.user.id;
    }

    get displayName() {
        return this.nickname ?? this.user.displayName;
    }

    isCommunicationDisabled() {
        return this.communicationDisabledUntilTimestamp !== null && this.communicationDisabledUntilTimestamp > Date.now();
    }

    toString() {
        return this.user.toString();
    }
}

export { InteractionGuildMember };