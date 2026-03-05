import Client from '../../client/client';
import { UserContextMenuCommandInteraction } from "../../structures/UserContextMenuCommandInteraction";
import { MessageContextMenuCommandInteraction } from "../../structures/MessageContextMenuCommandInteraction";

export default async function (client: Client, interaction: UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction, env: Env) {
    const command = client.contextMenuCommands.get(interaction.data.name);
    if (!command) {
        console.error('Unknown command:', interaction.data.name);
        return;
    }
    
    await command.execute(interaction, env)
}