import { APIPartialGuild } from "discord-api-types/v10";
import Client from "../client/client";
import { ImageURLOptions } from '@discordjs/rest';
import { DiscordSnowflake } from'@sapphire/snowflake';
import { Base } from './Base.js';

// The base class for a PartialGuild
class PartialGuild extends Base {
	id: APIPartialGuild['id'];
	name: APIPartialGuild['name'];
	icon: APIPartialGuild['icon'];
    splash: APIPartialGuild['splash'];
    banner: APIPartialGuild['banner'];
    description: APIPartialGuild['description'];
	features: APIPartialGuild['features'];
    verificationLevel: APIPartialGuild['verification_level'];
    vanityURLCode: APIPartialGuild['vanity_url_code'];

	constructor(client: Client, data: APIPartialGuild) {
		super(client);

		// The guild's id
		this.id = data.id;

		// The name of this guild
		this.name = data.name;

		// The icon hash of this guild
		this.icon = data.icon;

        // The hash of the guild invite splash image
        this.splash = data.splash;

        // The hash of the guild banner
        this.banner = data.banner;

        // The description of the guild, if any
        this.description = data.description;

		// An array of features available to this guild
		this.features = data.features;

        // The verification level of the guild
        this.verificationLevel = data.verification_level;

        // The vanity invite code of the guild, if any
        this.vanityURLCode = data.vanity_url_code;
	}

	// The timestamp this guild was created at
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	// The time this guild was created at
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	// The acronym that shows up in place of a guild icon
	get nameAcronym() {
		return this.name
		.replace(/'s /g, ' ')
		.replace(/\w+/g, e => e[0])
		.replace(/\s/g, '');
	}

	// The URL to this guild's icon.
	iconURL(options: ImageURLOptions = {}) {
		return this.icon && this.client.rest.cdn.icon(this.id, this.icon, options);
	}

    // The URL to this guild's banner.
    bannerURL(options: ImageURLOptions = {}) {
        return this.banner && this.client.rest.cdn.banner(this.id, this.banner, options);
    }

    // The URL to this guild's invite splash image.
    splashURL(options: ImageURLOptions = {}) {
        return this.splash && this.client.rest.cdn.splash(this.id, this.splash, options);
    }

	// When concatenated with a string, this automatically returns the guild's name instead of the Guild object.
	toString() {
		return this.name;
	}
}

export { PartialGuild };