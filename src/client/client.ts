import { APIInteraction, APIInteractionResponsePong, ApplicationCommandType, InteractionResponseType, InteractionType, APIInteractionResponse } from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";
import { SlashCommandBuilder } from "../index";
import { REST, DefaultRestOptions } from '@discordjs/rest';
import { registerCommands } from "../utils/registerCommands";
import { CommandInteraction } from "../structures/CommandInteraction";

class Client {
    commands: Map<string, SlashCommandBuilder> = new Map();

    get rest() {
        return new REST(DefaultRestOptions);
    }

    addCommand(command: SlashCommandBuilder): void {
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
                        // Handle chat input commands
                        const command = this.commands.get(interaction.data.name);
                        if (command) {
                            return this.respond(await command.execute( new CommandInteraction(this, interaction), env ));
                        } else {
                            console.error('Unknown command:', interaction.data.name);
                        }
                        break;
                    default:
                        console.error('Unknown command type:', interaction.data.type);
                        break;
                }
                break;
            case InteractionType.MessageComponent:
                // Handle message components
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

    private respond(payload: APIInteractionResponse) {
        return new Response(JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export default Client;