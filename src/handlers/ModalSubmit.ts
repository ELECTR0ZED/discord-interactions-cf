import Client from '../client/client';
import { ModalSubmitInteraction } from "../structures/ModalSubmitInteraction";

export default async function (client: Client, interaction: ModalSubmitInteraction, env: Env) {
    const modalCustomId = interaction.customId.split(client.customIdDelimiter)[0];
    const modalCustomIdData = interaction.customId.split(client.customIdDelimiter).slice(1);
    const modal = client.modals.get(modalCustomId);
    if (modal) {
        await modal.execute(interaction, env, modalCustomIdData)
    } else {
        console.error('Unknown modal:', modalCustomId);
    }
}