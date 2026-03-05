import Client from '../client/client';
import { MessageComponentInteraction } from '../structures/MessageComponentInteraction';

export default async function (client: Client, interaction: MessageComponentInteraction, env: Env) {
    const customId = interaction.data.custom_id.split(client.customIdDelimiter)[0];
    const customIdData = interaction.data.custom_id.split(client.customIdDelimiter).slice(1);
    const component = client.components.get(customId);
    if (component) {
        if (component.authorOnly && interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return new Response('Unauthorized', {
                status: 401,
            });
        }

        await component.execute(interaction, env, customIdData)
    } else {
        console.error('Unknown component:', customId);
    }
}