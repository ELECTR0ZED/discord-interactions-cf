import { DiscordSnowflake } from '@sapphire/snowflake';
import { GuildFeature, APIPartialInteractionGuild } from 'discord-api-types/v10';
import { Base } from './Base.js';
import Client from '../client/client.js';

// Represents a guild.
class PartialInteractionGuild extends Base {
    id: APIPartialInteractionGuild['id'];
    features: APIPartialInteractionGuild['features'];
    locale: APIPartialInteractionGuild['locale'];
    
    constructor(client: Client, data: APIPartialInteractionGuild) {
        super(client);

        this.id = data.id;
        this.features = data.features;
        this.locale = data.locale;
    }

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    get partnered() {
        return this.features.includes(GuildFeature.Partnered);
    }

    get verified() {
        return this.features.includes(GuildFeature.Verified);
    }
}

export { PartialInteractionGuild };