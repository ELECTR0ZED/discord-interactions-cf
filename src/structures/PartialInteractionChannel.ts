import { channelMention } from '@discordjs/formatters';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { APIChannel } from 'discord-api-types/v10';
import { Base } from './Base.js';
import { ChannelFlagsBitField } from 'discord.js';
import Client from '../client/client.js';

type APIPartialInteractionChannel = Partial<APIChannel> & Pick<APIChannel, 'id' | 'type'>;

// Represents any channel on Discord.
class PartialInteractionChannel extends Base {
    id: APIPartialInteractionChannel['id'];
    type: APIPartialInteractionChannel['type'];
    flags: ChannelFlagsBitField;

    constructor(client: Client, data: APIPartialInteractionChannel) {
        super(client);

        this.id = data.id;
        this.type = data.type;

        if ('flags' in data) {
            this.flags = new ChannelFlagsBitField(data.flags).freeze();
        } else {
            this.flags ??= new ChannelFlagsBitField().freeze();
        }

    }

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    toString() {
        return channelMention(this.id);
    }
}

export { PartialInteractionChannel };