import { 
    SlashCommandStringOption,
    ApplicationCommandOptionBase,
} from '@discordjs/builders';

export interface ApplicationCommandOptionBaseExtended extends ApplicationCommandOptionBase {
    execute?: typeof SlashCommandStringOption.prototype.execute
}