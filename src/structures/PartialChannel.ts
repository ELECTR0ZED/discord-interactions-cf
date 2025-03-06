
import { APIPartialChannel } from 'discord.js';
import Client from '../client/client.js';
import { Base } from './Base.js';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { channelMention } from '@discordjs/formatters';

// Represents a partial channel.
class PartialChannel extends Base {
    id: APIPartialChannel['id'];
    type: APIPartialChannel['type'];
    name: APIPartialChannel['name'];

    constructor(client: Client, data: APIPartialChannel) {
        super(client);

        // The channel's id
        this.id = data.id;

        // The type of the channel
        this.type = data.type;

        // The name of the channel
        this.name = data.name;

    }

    // The timestamp the channel was created at
    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    // The time the channel was created at
    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    // When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
    toString() {
        return channelMention(this.id);
    }
}

export { PartialChannel }