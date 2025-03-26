import { Base } from './Base';
import Client from '../client/client';
import { APIMessage } from 'discord-api-types/v10';
import { User } from './User';

class Message extends Base {
    id: APIMessage['id'];
    channelId: APIMessage['channel_id'];
    author: User;
    content: APIMessage['content'];
    timestamp: APIMessage['timestamp'];
    editedTimestamp: APIMessage['edited_timestamp'];
    tts: APIMessage['tts'];
    mentionEveryone: APIMessage['mention_everyone'];
    mentions: User[];
    mentionRoles: APIMessage['mention_roles'];
    mentionChannels: APIMessage['mention_channels'];
    attachments: APIMessage['attachments'];
    embeds: APIMessage['embeds'];
    reactions: APIMessage['reactions'];
    nonce: APIMessage['nonce'];
    pinned: APIMessage['pinned'];
    webhookId: APIMessage['webhook_id'];
    type: APIMessage['type'];
    activity: APIMessage['activity'];
    application: APIMessage['application'];
    applicationId: APIMessage['application_id'];
    messageReference: APIMessage['message_reference'];
    flags: APIMessage['flags'];
    referencedMessage: APIMessage['referenced_message'];
    interactionMetadata: APIMessage['interaction_metadata'];
    thread: APIMessage['thread'];
    components: APIMessage['components'];
    stickerItems: APIMessage['sticker_items'];
    position: APIMessage['position'];
    roleSubscriptionData: APIMessage['role_subscription_data'];
    resolved: APIMessage['resolved'];
    poll: APIMessage['poll'];
    messageSnapshots: APIMessage['message_snapshots'];
    call: APIMessage['call'];

    constructor(client: Client, data: APIMessage) {
        super(client);

        // The message ID
        this.id = data.id;

        // The channel ID
        this.channelId = data.channel_id;

        // The author of the message
        this.author = new User(client, data.author);

        // The content of the message
        this.content = data.content;

        // The timestamp of the message
        this.timestamp = data.timestamp;

        // The timestamp of the last edit
        this.editedTimestamp = data.edited_timestamp;
        
        // Whether the message is a TTS message
        this.tts = data.tts;

        // Whether the message mentions everyone
        this.mentionEveryone = data.mention_everyone;

        // The users mentioned in the message
        this.mentions = data.mentions.map(user => new User(client, user));

        // The roles mentioned in the message
        this.mentionRoles = data.mention_roles;

        // The channels mentioned in the message
        this.mentionChannels = data.mention_channels;

        // The attachments in the message
        this.attachments = data.attachments;

        // The embeds in the message
        this.embeds = data.embeds;

        // The reactions to the message
        this.reactions = data.reactions;

        // The nonce of the message
        this.nonce = data.nonce;

        // Whether the message is pinned
        this.pinned = data.pinned;

        // The ID of the webhook
        this.webhookId = data.webhook_id;

        // The type of the message
        this.type = data.type;

        // The activity in the message
        this.activity = data.activity;

        // The application of the message
        this.application = data.application;

        // The application ID of the message
        this.applicationId = data.application_id;

        // The message reference
        this.messageReference = data.message_reference;

        // The flags of the message
        this.flags = data.flags;

        // The referenced message
        this.referencedMessage = data.referenced_message;

        // The interaction metadata
        this.interactionMetadata = data.interaction_metadata;

        // The thread
        this.thread = data.thread;

        // The components in the message
        this.components = data.components;

        // The sticker items in the message
        this.stickerItems = data.sticker_items;

        // The position of the message
        this.position = data.position;

        // The role subscription data
        this.roleSubscriptionData = data.role_subscription_data;

        // The resolved data of the message
        this.resolved = data.resolved;

        // The poll data of the message
        this.poll = data.poll;

        // The message snapshots
        this.messageSnapshots = data.message_snapshots;

        // The call data of the message
        this.call = data.call;
    }

}

export { Message };