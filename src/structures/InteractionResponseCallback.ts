import { APIInteractionResponseCallbackData  } from 'discord-api-types/v10';

export interface InteractionResponseCallbackOptions {
    tts?: boolean;
    content?: string;
    embeds?: any[];
    allowedMentions?: any;
    flags?: number;
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
        return {
            tts: this.options.tts ?? false,
            content: this.options.content ?? '',
            embeds: this.options.embeds ?? [],
            // allowed_mentions,
            flags: this.options.flags ?? 0,
            components: this.options.components ?? [],
            // attachments: this.options.attachments,
            // poll,
        };
    }
}

export { InteractionResponseCallback };