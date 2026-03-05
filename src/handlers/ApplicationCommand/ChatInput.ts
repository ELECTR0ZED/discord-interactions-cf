import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder";
import { SlashCommandSubcommandBuilder } from "../../builders/SlashCommandSubcommandBuilder";
import { ChatInputCommandInteraction } from "../../structures/ChatInputCommandInteraction";
import { getSubcommandCommand } from "../../helpers/command";
import Client from "../../client/client";

export default async function (client: Client, interaction: ChatInputCommandInteraction, env: Env) {
    const command = client.commands.get(interaction.data.name);
    if (!command) {
        console.error('Unknown command:', interaction.data.name);
        return
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    let commandToExecute: SlashCommandBuilder | SlashCommandSubcommandBuilder = command;
    
    if (subcommand) {
        const subcommandCommand = getSubcommandCommand(command, subcommandGroup, subcommand);
        if (!subcommandCommand) {
            console.error(
                subcommandGroup
                ? `Unknown subcommand group "${subcommandGroup}" or subcommand "${subcommand}"`
                : `Unknown subcommand: ${subcommand}`
            );
            return;
        }

        commandToExecute = subcommandCommand;
    }

    // Execute command
    await commandToExecute.execute(interaction, env)
}