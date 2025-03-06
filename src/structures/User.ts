'use strict';

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
	bot: APIUser['bot'] | null;
	system: APIUser['system'] | null;
	flags: UserFlagsBitField | null;
	username?: APIUser['username'];
	globalName?: APIUser['global_name'];
	discriminator?: APIUser['discriminator'];
	avatar?: APIUser['avatar'];
	banner?: APIUser['banner'];
	accentColor?: APIUser['accent_color'];
	avatarDecorationData?: {
		asset: APIAvatarDecorationData['asset'];
		skuId: APIAvatarDecorationData['sku_id']; 
	} | null;


	constructor(client: Client, data: APIUser) {
		super(client);

		// The user's id
		this.id = data.id;

		this.bot = null;

		this.system = null;

		this.flags = null;

		this._patch(data);
	}

	_patch(data: APIUser) {
		if ('username' in data) {
			// The username of the user
			this.username = data.username;
		}

		if ('global_name' in data) {
			// The global name of this user
			this.globalName = data.global_name;
		} else {
			this.globalName ??= null;
		}

		if ('bot' in data) {
			// Whether or not the user is a bot
			this.bot = Boolean(data.bot);
		} else if (!this.partial && typeof this.bot !== 'boolean') {
			this.bot = false;
		}

		if ('discriminator' in data) {
			// The discriminator of this user
			this.discriminator = data.discriminator;
		}

		if ('avatar' in data) {
			// The user avatar's hash
			this.avatar = data.avatar;
		} else {
			this.avatar ??= null;
		}

		if ('banner' in data) {
			// The user banner's hash
			this.banner = data.banner;
		} else if (this.banner !== null) {
			this.banner ??= undefined;
		}

		if ('accent_color' in data) {
			// The base 10 accent color of the user's banner
			this.accentColor = data.accent_color;
		} else if (this.accentColor !== null) {
			this.accentColor ??= undefined;
		}

		if ('system' in data) {
			// Whether the user is an Official Discord System user (part of the urgent message system)
			this.system = Boolean(data.system);
		} else if (!this.partial && typeof this.system !== 'boolean') {
			this.system = false;
		}

		if ('public_flags' in data) {
			// The flags for this user
			this.flags = new UserFlagsBitField(data.public_flags);
		}

		/**
		 * @typedef {Object} AvatarDecorationData
		 * @property {string} asset The avatar decoration hash
		 * @property {Snowflake} skuId The id of the avatar decoration's SKU
		 */

		if (data.avatar_decoration_data) {
			// The user avatar decoration's data
			this.avatarDecorationData = {
				asset: data.avatar_decoration_data.asset,
				skuId: data.avatar_decoration_data.sku_id,
			};
		} else {
			this.avatarDecorationData = null;
		}
	}

	// Whether this User is a partial
	get partial() {
		return typeof this.username !== 'string';
	}

	// The timestamp the user was created at
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	// The time the user was created at
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	// A link to the user's avatar.
	avatarURL(options: ImageURLOptions = {}) {
		return this.avatar && this.client.rest.cdn.avatar(this.id, this.avatar, options);
	}

	// A link to the user's avatar decoration.
	avatarDecorationURL() {
		return this.avatarDecorationData ? this.client.rest.cdn.avatarDecoration(this.avatarDecorationData.asset) : null;
	}

	// A link to the user's default avatar
	get defaultAvatarURL() {
		const index = this.discriminator === '0' ? calculateUserDefaultAvatarIndex(this.id) : Number(this.discriminator) % 5;
		return this.client.rest.cdn.defaultAvatar(index);
	}

	// A link to the user's avatar if they have one.
	displayAvatarURL(options: ImageURLOptions = {}) {
		return this.avatarURL(options) ?? this.defaultAvatarURL;
	}

	// The hexadecimal version of the user accent color, with a leading hash
	get hexAccentColor() {
		if (typeof this.accentColor !== 'number') return this.accentColor;
		return `#${this.accentColor.toString(16).padStart(6, '0')}`;
	}

	// A link to the user's banner
	bannerURL(options: ImageURLOptions = {}) {
		return this.banner && this.client.rest.cdn.banner(this.id, this.banner, options);
	}

	// The tag of this user
	get tag() {
		return typeof this.username === 'string'
		? this.discriminator === '0'
			? this.username
			: `${this.username}#${this.discriminator}`
		: null;
	}

	// The global name of this user, or their username if they don't have one
	get displayName() {
		return this.globalName ?? this.username;
	}

	// When concatenated with a string, this automatically returns the user's mention instead of the User object.
	toString() {
		return userMention(this.id);
	}

}

export { User };