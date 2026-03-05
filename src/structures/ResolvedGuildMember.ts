import { APIInteractionDataResolvedGuildMember, APIAvatarDecorationData } from "discord-api-types/v10";
import Client from "../client/client";
import { PartialInteractionGuild } from "./PartialInteractionGuild";
import { Base } from './Base.js';
import { ImageURLOptions } from '@discordjs/rest';
import { User } from './User';

// Represents a member of a guild on Discord.
class ResolvedGuildMember extends Base {
    user: User;
    guild: PartialInteractionGuild;
    nickname: APIInteractionDataResolvedGuildMember['nick'];
    avatar: APIInteractionDataResolvedGuildMember['avatar'];
    banner: APIInteractionDataResolvedGuildMember['banner'];
    roles: APIInteractionDataResolvedGuildMember['roles'];
    joinedTimestamp: number|null;
    premiumSinceTimestamp: number | null;
    flags: APIInteractionDataResolvedGuildMember['flags'];
    pending: APIInteractionDataResolvedGuildMember['pending'];
    communicationDisabledUntilTimestamp: number | null;
    avatarDecorationData: {
        asset: APIAvatarDecorationData['asset'];
        skuId: APIAvatarDecorationData['sku_id']; 
    } | null;
    permissions: APIInteractionDataResolvedGuildMember['permissions'];

    constructor(client: Client, member: APIInteractionDataResolvedGuildMember, user: User, guild: PartialInteractionGuild) {
        super(client);

        this.user = user;
        this.guild = guild;
        this.nickname = member.nick;
        this.avatar = member.avatar;
        this.banner = member.banner;
        this.roles = member.roles;
        this.joinedTimestamp = member.joined_at ? Date.parse(member.joined_at) : null;
        this.premiumSinceTimestamp = member.premium_since ? Date.parse(member.premium_since) : null;
        this.flags = member.flags;
        this.pending = member.pending ?? false;
        this.communicationDisabledUntilTimestamp = member.communication_disabled_until ? Date.parse(member.communication_disabled_until) : null;
        this.avatarDecorationData = member.avatar_decoration_data ? {
			asset: member.avatar_decoration_data.asset,
			skuId: member.avatar_decoration_data.sku_id,
		} : null;
        this.permissions = member.permissions;
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

export { ResolvedGuildMember };