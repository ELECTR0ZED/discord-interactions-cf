import { 
    APIInteraction,
    APIInteractionResponsePong,
    ApplicationCommandType,
    InteractionResponseType,
    InteractionType,
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
} from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";
import { SlashCommandBuilder, SlashCommandComponentBuilder, ApplicationCommandOptionBaseExtended, SlashCommandSubcommandBuilder } from "../index";
import { REST, DefaultRestOptions } from '@discordjs/rest';
import { registerCommands } from "../utils/registerCommands";
import { ChatInputCommandInteraction } from "../structures/ChatInputCommandInteraction";
import { MessageComponentInteraction } from "../structures/MessageComponentInteraction";
import { getSubcommandCommand } from "../helpers/command";
import { AutocompleteInteraction } from "../structures/AutocompleteInteraction";

type Hook = (
  interaction: ChatInputCommandInteraction | MessageComponentInteraction
) => Promise<boolean> | boolean;

class Client {
    commands: Map<string, SlashCommandBuilder> = new Map();
    components: Map<string, SlashCommandComponentBuilder> = new Map();
    componentCustomIdDelimiter = ':';
    private beforeHooks: Hook[] = [];
    private afterHooks: Hook[] = [];

    constructor(componentCustomIdDelimiter?: string) {
        if (componentCustomIdDelimiter) {
            this.componentCustomIdDelimiter = componentCustomIdDelimiter;
        }

        this.fetch = this.fetch.bind(this);
    }

    get rest() {
        return new REST(DefaultRestOptions);
    }

    addCommand(command: SlashCommandBuilder) {
        if (typeof command.toJSON !== 'function') {
            throw new Error('Invalid command object. Ensure it is built using SlashCommandBuilder.');
        }

        const json = command.toJSON();
        if (json && typeof json !== 'object') {
            throw new Error('Invalid command object. Ensure it is built using SlashCommandBuilder.');
        }

        if (!command.name) {
            throw new Error('Command must have a name.');
        }

        if (this.commands.has(command.name)) {
            throw new Error(`Command with name "${command.name}" already exists.`);
        }

        this.commands.set(command.name, command);

        return this;
    }

    addComponent(component: SlashCommandComponentBuilder) {

        if (!component.customId) {
            throw new Error('Component must have a custom id.');
        }

        if (this.components.has(component.customId)) {
            throw new Error(`Component with custom id "${component.customId}" already exists.`);
        }

        this.components.set(component.customId, component);

        return this;
    }

    addBeforeHook(fn: Hook) {
        this.beforeHooks.push(fn);
        return this;
    }

    addAfterHook(fn: Hook) {
        this.afterHooks.push(fn);
        return this;
    }

    /**
     * Run an array of hooks in sequence.  
     * → If any returns (or resolves to) false, stop and return false.  
     * → Otherwise return true.
     */
    private async runHooks(
        hooks: Hook[],
        interaction: ChatInputCommandInteraction | MessageComponentInteraction
    ): Promise<boolean> {
        for (const hook of hooks) {
            const result = await Promise.resolve(hook(interaction));
            if (result === false) return false;
        }

        return true;
    }

    async fetch(
        request: Request,
        env: Env,
        ctx: any,
    ) {
        const url = new URL(request.url);

        if (url.pathname === '/register') {
            const authHeader = request.headers.get('Authorization');
            if (!env.TOKEN) {
                return new Response('Command registering not configured', {
                    status: 500,
                });
            }
            if (!authHeader || authHeader !== `Bearer ${env.TOKEN}`) {
                return new Response('Unauthorized', {
                    status: 401,
                });
            }

            // Register commands with Discord
            await this.registerCommands(env.TOKEN, env.CLIENT_ID);
            return new Response('Commands registered', {
                status: 200,
            });
        }

        const body = await request.text();
        const headers = request.headers;

        // Verify the request signature
        const verified = await verifyKey(headers, body, env.PUBLIC_KEY);
        if (!verified) {
            return new Response('Invalid request signature', {
                status: 401,
            });
        }

        // Parse the interaction
        const interaction = JSON.parse(body) as APIInteraction;

        if (interaction.application_id !== env.CLIENT_ID) {
            return new Response('Invalid application ID', {
                status: 401,
            });
        }

        // If the interaction is a ping, respond with a pong
        if (interaction.type === InteractionType.Ping) {
            const response: APIInteractionResponsePong = {
                type: InteractionResponseType.Pong,
            };

            return new Response(JSON.stringify(response), {
                status: 200,
            });
        }

        // Handle other interaction types here
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                switch (interaction.data.type) {
                    case ApplicationCommandType.ChatInput:
                        const chatInteraction = new ChatInputCommandInteraction(
                            this,
                            interaction as APIChatInputApplicationCommandInteraction
                        );
                        const command = this.commands.get(chatInteraction.data.name);
                        if (!command) {
                            console.error('Unknown command:', chatInteraction.data.name);
                            break;
                        }

                        const beforeResult = await this.runHooks(this.beforeHooks, chatInteraction);
                        if (!beforeResult) {
                            if (chatInteraction.response) {
                                return this.respond(chatInteraction.response);
                            }

                            return new Response(null, { status: 200 });
                        }
                        
                        const subcommandGroup = chatInteraction.options.getSubcommandGroup();
                        const subcommand = chatInteraction.options.getSubcommand();

                        let commandToExecute: SlashCommandBuilder | SlashCommandSubcommandBuilder = command;
                        
                        if (subcommand) {
                            const subcommandCommand = getSubcommandCommand(command, subcommandGroup, subcommand);
                            if (!subcommandCommand) {
                                console.error(
                                    subcommandGroup
                                    ? `Unknown subcommand group "${subcommandGroup}" or subcommand "${subcommand}"`
                                    : `Unknown subcommand: ${subcommand}`
                                );
                                break;
                            }
                            
                            commandToExecute = subcommandCommand;
                        }

                        // Execute command
                        await commandToExecute.execute(chatInteraction, env)

                        const afterResult = await this.runHooks(this.afterHooks, chatInteraction);
                        if (!afterResult) {
                            if (chatInteraction.response) {
                                return this.respond(chatInteraction.response);
                            }

                            return new Response(null, { status: 200 });
                        }


                        return this.respond(chatInteraction.response);
                    default:
                        console.error('Unknown command type:', interaction.data.type);
                        break;
                }
                break;
            case InteractionType.MessageComponent:
                // Handle message components
                const componentInteraction = interaction as APIMessageComponentInteraction;
                const customId = componentInteraction.data.custom_id.split(this.componentCustomIdDelimiter)[0];
                const customIdData = componentInteraction.data.custom_id.split(this.componentCustomIdDelimiter).slice(1);
                const component = this.components.get(customId);
                if (component) {
                    const msgComponentInteraction = new MessageComponentInteraction(this, componentInteraction)
                    if (component.authorOnly && msgComponentInteraction.user.id !== msgComponentInteraction.message.interactionMetadata?.user.id) {
                        return new Response('Unauthorized', {
                            status: 401,
                        });
                    }
                    return this.respond(
                        await component.execute(msgComponentInteraction, env, customIdData)
                    );
                } else {
                    console.error('Unknown component:', customId);
                }
                break;
            case InteractionType.ApplicationCommandAutocomplete:
                const autocompleteInteraction = new AutocompleteInteraction(
                    this,
                    interaction as APIApplicationCommandAutocompleteInteraction
                );

                const focusedOption = autocompleteInteraction.options.getFocused();
                const focusedOptionName = focusedOption.name;
                const focusedOptionValue = focusedOption.value as string;

                const commandAutocomplete = this.commands.get(autocompleteInteraction.commandName);
                if (!commandAutocomplete) {
                    console.error('Unknown command:', autocompleteInteraction.commandName);
                    break;
                }
                const subcommandGroup = autocompleteInteraction.options.getSubcommandGroup();
                const subcommand = autocompleteInteraction.options.getSubcommand();
                let option: ApplicationCommandOptionBaseExtended | undefined;
                if (subcommand) {
                    const subcommandCommand = getSubcommandCommand(commandAutocomplete, subcommandGroup, subcommand);
                    if (!subcommandCommand) {
                        console.error(
                            subcommandGroup
                            ? `Unknown subcommand group "${subcommandGroup}" or subcommand "${subcommand}"`
                            : `Unknown subcommand: ${subcommand}`
                        );
                        break;
                    }
                    option = subcommandCommand.options.find(o => o.name === focusedOptionName);
                } else {
                    option = commandAutocomplete.options.find(o => o.name === focusedOptionName);
                }
                if (!option) {
                    console.error('Unknown option:', focusedOptionName);
                    break;
                }
                
                if (option && typeof option.execute === 'function') {
                    return this.respond(
                        await option.execute(autocompleteInteraction, focusedOptionValue, env)
                    );
                } else {
                    console.error('Option does not have an execute function:', focusedOptionName);
                }

                break;
            case InteractionType.ModalSubmit:
                // Handle modal submits
                break;
            default:
                console.error('Unknown interaction type:', (interaction as APIInteraction).type);
                break;
        }
    }

    async registerCommands(token: string, clientId: string) {
        const commands = Array.from(this.commands.values()).map(command => command.toJSON());
        
        await registerCommands(commands, token, clientId);
    }

    private respond(payload: APIInteractionResponse|null|undefined) {
        if (!payload) return new Response(null, { status: 200 });

        return new Response(JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export default Client;