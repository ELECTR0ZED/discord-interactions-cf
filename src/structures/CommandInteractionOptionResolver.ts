import { 
    ApplicationCommandOptionType,
    APIInteractionDataResolved,
    ChannelType,
 } from 'discord-api-types/v10';
import { CommandInteractionOption } from './BaseInteraction';

// A resolver for command interaction options.
class CommandInteractionOptionResolver {
    private readonly _group: string | null;
    private readonly _subcommand: string | null;
    private readonly _hoistedOptions: CommandInteractionOption[];
    readonly data: ReadonlyArray<CommandInteractionOption>;
    readonly resolved: Readonly<APIInteractionDataResolved> | null;

    constructor( options: CommandInteractionOption[], resolved?: APIInteractionDataResolved ) {
        // The name of the subcommand group.
        this._group = null;

        // The name of the subcommand.
        this._subcommand = null;

        // The bottom-level options for the interaction.
        // If there is a subcommand (or subcommand and group), this is the options for the subcommand.
        this._hoistedOptions = options;

        // Hoist subcommand group if present
        if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.SubcommandGroup) {
            this._group = this._hoistedOptions[0].name;
            this._hoistedOptions = this._hoistedOptions[0].options ?? [];
        }
        // Hoist subcommand if present
        if (this._hoistedOptions[0]?.type === ApplicationCommandOptionType.Subcommand) {
            this._subcommand = this._hoistedOptions[0].name;
            this._hoistedOptions = this._hoistedOptions[0].options ?? [];
        }

        // The interaction options array.
        this.data = Object.freeze([...options]);

        // The interaction resolved data.
        this.resolved = resolved ? Object.freeze(resolved) : null;
    }

    // Gets an option by its name.
    get(name: string, required: boolean = false) {
        const option = this._hoistedOptions.find(opt => opt.name === name);
        if (!option) {
            if (required) {
                throw new Error('Required option not found');
            }
            return null;
        }
        return option;
    }

    // Gets an option by name and property and checks its type.
    private _getTypedOption(
        name: string, 
        allowedTypes: ApplicationCommandOptionType[], 
        properties: string[], 
        required: boolean = false
    ): CommandInteractionOption | null {
        const option = this.get(name);
        if (!option) {
            return null;
        } else if (!allowedTypes.includes(option.type)) {
            throw new Error('Invalid option type');
        } else if (required && properties.every(prop => option[prop as keyof CommandInteractionOption] === null || option[prop as keyof CommandInteractionOption] === undefined)) {
            throw new Error('Required option not found');
        }
        return option;
    }

    // Gets the selected subcommand.
    getSubcommand(required: boolean = false) {
        if (required && !this._subcommand) {
            throw new Error('Required subcommand not found');
        }

        return this._subcommand;
    }

    // Gets the selected subcommand group.
    getSubcommandGroup(required: boolean = false) {
        if (required && !this._group) {
            throw new Error('Required subcommand group not found');
        }
        return this._group;
    }

    // Gets a boolean option.
    getBoolean(name: string, required: boolean = false) {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Boolean], ['value'], required);
        return option?.value ?? null;
    }

    // Gets a channel option.
    getChannel(name: string, required: boolean = false, channelTypes: ChannelType[] = []) {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Channel], ['channel'], required);
        const channel = option?.channel ?? null;

        if (channel && channelTypes.length > 0 && !channelTypes.includes(channel.type)) {
            throw new Error('Invalid channel type');
        }

        return channel;
    }

    // Gets a string option.
    getString(name: string, required: boolean = false): string|null {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.String], ['value'], required);
        return option?.value as string ?? null;
    }

    // Gets an integer option.
    getInteger(name: string, required: boolean = false): number|null {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Integer], ['value'], required);
        return option?.value as number ?? null;
    }

    // Gets a number option.
    getNumber(name: string, required: boolean = false): number|null {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Number], ['value'], required);
        return option?.value as number ?? null;
    }

    // Gets a user option.
    getUser(name: string, required: boolean = false) {
        const option = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
            ['user'],
            required,
        );
        return option?.user ?? null;
    }

    // Gets a member option.
    getMember(name: string) {
        const option = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.User, ApplicationCommandOptionType.Mentionable],
            ['member'],
            false,
        );
        return option?.member ?? null;
    }

    // Gets a role option.
    getRole(name: string, required: boolean = false) {
        const option = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.Role, ApplicationCommandOptionType.Mentionable],
            ['role'],
            required,
        );
        return option?.role ?? null;
    }

    // Gets an attachment option.
    getAttachment(name: string, required: boolean = false) {
        const option = this._getTypedOption(name, [ApplicationCommandOptionType.Attachment], ['attachment'], required);
        return option?.attachment ?? null;
    }

    // Gets a mentionable option.
    getMentionable(name: string, required: boolean = false) {
        const option = this._getTypedOption(
            name,
            [ApplicationCommandOptionType.Mentionable],
            ['user', 'member', 'role'],
            required,
        );
        return option?.member ?? option?.user ?? option?.role ?? null;
    }

    // Gets the focused option.
    getFocused() {
        const focusedOption = this._hoistedOptions.find(option => option.focused);
        if (!focusedOption) throw new Error('No focused option found');
        return focusedOption;
    }
}

export { CommandInteractionOptionResolver };