import { APIInteractionResponseCallbackData, MessageFlags } from 'discord-api-types/v10';

export interface InteractionResponseCallbackOptions {
    tts?: boolean;
    content?: string;
    embeds?: any[];
    allowedMentions?: any;
    flags?: MessageFlags[] | number;
    components?: any[];
    attachments?: any;
    poll?: any;
}

// Represents a message to be sent to the API.
class InteractionResponseCallback {
    options: InteractionResponseCallbackOptions;

    constructor(options: InteractionResponseCallbackOptions) {
        this.options = options;
    }

    toJSON(): APIInteractionResponseCallbackData {
        const flags = typeof this.options.flags === 'number' ? this.options.flags : (this.options.flags?.reduce<number>((acc, flag) => acc | flag, 0) ?? 0);
        return {
            tts: this.options.tts ?? false,
            content: this.options.content ?? '',
            embeds: this.options.embeds ?? [],
            // allowed_mentions,
            flags: flags,
            components: this.options.components ?? [],
            // attachments: this.options.attachments,
            // poll,
        };
    }
}

export { InteractionResponseCallback };