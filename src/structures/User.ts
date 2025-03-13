import { APIAvatarDecorationData, APIUser } from 'discord-api-types/v10';
import { userMention } from '@discordjs/formatters';
import { calculateUserDefaultAvatarIndex, ImageURLOptions } from '@discordjs/rest';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { UserFlagsBitField } from 'discord.js';
import { Base } from './Base';
import Client from '../client/client';

// Represents a user on Discord.
class User extends Base {
	id: APIUser['id'];
	username: APIUser['username'];
	discriminator: APIUser['discriminator'];
	globalName: APIUser['global_name'];
	avatar: APIUser['avatar'];
	bot: APIUser['bot'] | null;
	system: APIUser['system'] | null;
	mfaEnabled: APIUser['mfa_enabled'];
	banner: APIUser['banner'];
	accentColor: APIUser['accent_color'];
	locale: APIUser['locale'];
	verified: APIUser['verified'];
	email: APIUser['email'];
	flags: UserFlagsBitField | null;
	premiumType: APIUser['premium_type'];
	publicFlags: APIUser['public_flags'];
	avatarDecorationData: {
		asset: APIAvatarDecorationData['asset'];
		skuId: APIAvatarDecorationData['sku_id']; 
	} | null;


	constructor(client: Client, data: APIUser) {
		super(client);

		this.id = data.id;
		this.username = data.username;
		this.discriminator = data.discriminator;
		this.globalName = data.global_name;
		this.avatar = data.avatar;
		this.bot = data.bot;
		this.system = data.system;
		this.mfaEnabled = data.mfa_enabled;
		this.banner = data.banner;
		this.accentColor = data.accent_color;
		this.locale = data.locale;
		this.verified = data.verified;
		this.email = data.email;
		this.flags = new UserFlagsBitField(data.public_flags);
		this.premiumType = data.premium_type;
		this.publicFlags = data.public_flags;
		this.avatarDecorationData = data.avatar_decoration_data ? {
			asset: data.avatar_decoration_data.asset,
			skuId: data.avatar_decoration_data.sku_id,
		} : null;
	}

	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	avatarURL(options: ImageURLOptions = {}) {
		return this.avatar && this.client.rest.cdn.avatar(this.id, this.avatar, options);
	}

	avatarDecorationURL() {
		return this.avatarDecorationData ? this.client.rest.cdn.avatarDecoration(this.avatarDecorationData.asset) : null;
	}

	get defaultAvatarURL() {
		const index = this.discriminator === '0' ? calculateUserDefaultAvatarIndex(this.id) : Number(this.discriminator) % 5;
		return this.client.rest.cdn.defaultAvatar(index);
	}

	displayAvatarURL(options: ImageURLOptions = {}) {
		return this.avatarURL(options) ?? this.defaultAvatarURL;
	}

	get hexAccentColor() {
		if (typeof this.accentColor !== 'number') return this.accentColor;
		return `#${this.accentColor.toString(16).padStart(6, '0')}`;
	}

	bannerURL(options: ImageURLOptions = {}) {
		return this.banner && this.client.rest.cdn.banner(this.id, this.banner, options);
	}

	get tag() {
		return typeof this.username === 'string'
		? this.discriminator === '0'
			? this.username
			: `${this.username}#${this.discriminator}`
		: null;
	}

	get displayName() {
		return this.globalName ?? this.username;
	}

	toString() {
		return userMention(this.id);
	}
}

export { User };