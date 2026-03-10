import Client from '../client/client';
import { AutocompleteInteraction } from "../structures/AutocompleteInteraction";
import { ApplicationCommandOptionBaseExtended } from '../builders/ApplicationCommandOptionBaseExtended';
import { getSubcommandCommand } from "../helpers/command";

export default async function (client: Client, interaction: AutocompleteInteraction, env: Env) {
    const focusedOption = interaction.options.getFocused();
    const focusedOptionName = focusedOption.name;
    const focusedOptionValue = focusedOption.value as string;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error('Unknown command:', interaction.commandName);
        return;
    }

    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    let option: ApplicationCommandOptionBaseExtended | undefined;
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
        option = subcommandCommand.options.find(o => o.name === focusedOptionName);
    } else {
        option = command.options.find(o => o.name === focusedOptionName);
    }
    if (!option) {
        console.error('Unknown option:', focusedOptionName);
        return;
    }

    if (option && typeof option.execute === 'function') {
        await option.execute(interaction, focusedOptionValue, env)
    } else {
        console.error('Option does not have an execute function:', focusedOptionName);
    }
}