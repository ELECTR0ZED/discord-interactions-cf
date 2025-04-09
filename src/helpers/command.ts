import { 
    ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "../index";
import { SlashCommandSubcommandGroupBuilder } from '@discordjs/builders'

export function getSubcommandCommand(
    command: SlashCommandBuilder,
    subcommandGroup: string | null,
    subcommand: string
): SlashCommandSubcommandBuilder | undefined {
    if (subcommandGroup) {
        const groupCommand = command.options.find(option => {
            const data = option.toJSON();
            return (
                (data.type as ApplicationCommandOptionType) === ApplicationCommandOptionType.SubcommandGroup &&
                data.name === subcommandGroup
            );
        }) as SlashCommandSubcommandGroupBuilder | undefined;

        return groupCommand?.options.find(option => {
            const data = option.toJSON();
            return (
                data.type === ApplicationCommandOptionType.Subcommand &&
                data.name === subcommand
            );
        }) as SlashCommandSubcommandBuilder | undefined;
    } else {
        return command.options.find(option => {
            const data = option.toJSON();
            return (
                (data.type as ApplicationCommandOptionType) === ApplicationCommandOptionType.Subcommand &&
                data.name === subcommand
            );
        }) as SlashCommandSubcommandBuilder | undefined;
    }
}