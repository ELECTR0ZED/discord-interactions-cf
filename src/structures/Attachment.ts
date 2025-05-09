import { APIAttachment } from "discord-api-types/v10";

// Represents an attachment
class Attachment {
    attachment: APIAttachment['url'];
    name: APIAttachment['filename'];
    id: APIAttachment['id'];
    size: APIAttachment['size'];
    url: APIAttachment['url'];
    proxyURL: APIAttachment['proxy_url'];
    height: APIAttachment['height'];
    width: APIAttachment['width'];
    contentType: APIAttachment['content_type'];
    description: APIAttachment['description'];
    ephemeral: boolean;
    duration: APIAttachment['duration_secs'];
    waveform: APIAttachment['waveform'];
    flags: APIAttachment['flags'];
    title: APIAttachment['title'];

    constructor(data: APIAttachment) {
        this.attachment = data.url;

        // The name of this attachment
        this.name = data.filename;

        // The attachment's id
        this.id = data.id;

        // The size of this attachment in bytes
        this.size = data.size;

        // The URL to this attachment
        this.url = data.url;

        // The Proxy URL to this attachment
        this.proxyURL = data.proxy_url;

        // The height of this attachment (if an image or video)
        this.height = data.height;

        // The width of this attachment (if an image or video)
        this.width = data.width;

        // The media (MIME) type of this attachment
        this.contentType = data.content_type;

        // The description (alt text) of this attachment
        this.description = data.description;

        // Whether this attachment is ephemeral
        this.ephemeral = data.ephemeral ?? false;

        // The duration of this attachment in seconds
        this.duration = data.duration_secs;

        // The base64 encoded byte array representing a sampled waveform
        this.waveform = data.waveform;

        // The flags of this attachment
        this.flags = data.flags;

        this.title = data.title;
    }

    // Whether or not this attachment has been marked as a spoiler
    get spoiler() {
        return (this.url ?? this.name).startsWith('SPOILER_');
    }
}

export { Attachment };