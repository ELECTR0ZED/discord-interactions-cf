import { 
    APIInteraction,
    APIInteractionResponsePong,
    ApplicationCommandType,
    InteractionResponseType,
    InteractionType,
    APIInteractionResponse,
    APIChatInputApplicationCommandInteraction,
    APIMessageComponentInteraction,
    ApplicationCommandOptionType,
} from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";
import { SlashCommandBuilder, SlashCommandComponentBuilder, SlashCommandSubcommandBuilder } from "../index";
import { REST, DefaultRestOptions } from '@discordjs/rest';
import { registerCommands } from "../utils/registerCommands";
import { ChatInputCommandInteraction } from "../structures/ChatInputCommandInteraction";
import { MessageComponentInteraction } from "../structures/MessageComponentInteraction";

class Client {
    commands: Map<string, SlashCommandBuilder> = new Map();
    components: Map<string, SlashCommandComponentBuilder> = new Map();
    componentCustomIdDelimiter = ':';

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

    async fetch(
        request: Request,
        env: Env,
        ctx: any,
    ) {
        const url = new URL(request.url);

        if (url.pathname === '/register') {
            const authHeader = request.headers.get('Authorization');
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
                        const chatInteraction = new ChatInputCommandInteraction(this, interaction as APIChatInputApplicationCommandInteraction);
                        const command = this.commands.get(chatInteraction.data.name);
                        if (command) {
                            const subcommand = chatInteraction.options.getSubcommand();
                            if (subcommand) {
                                const subcommandCommand = command.options.find(
                                    option => 
                                        option.toJSON().type === ApplicationCommandOptionType.Subcommand && 
                                        option.toJSON().name === subcommand
                                    ) as SlashCommandSubcommandBuilder | undefined;
                                if (!subcommandCommand) {
                                    console.error('Unknown subcommand:', subcommand);
                                    break;
                                }
                                return this.respond(
                                    await subcommandCommand.execute(chatInteraction, env)
                                );
                            } else {
                                return this.respond(
                                    await command.execute(chatInteraction, env)
                                );
                            }
                        } else {
                            console.error('Unknown command:', chatInteraction.data.name);
                        }
                        break;
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
                // Handle application command autocomplete
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

    private respond(payload: APIInteractionResponse|undefined) {
        if (!payload) return

        return new Response(JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export default Client;