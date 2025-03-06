import { APIInteraction, APIInteractionResponsePong, ApplicationCommandType, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";
import { assert } from "console";
import { SlashCommandBuilder } from "../index";

class Client {
    commands: Map<string, SlashCommandBuilder> = new Map();

    constructor() {}

    async addCommand(command: SlashCommandBuilder): Promise<void> {
        if (typeof command.toJSON !== 'function') {
            throw new Error('Invalid command object. Ensure it is built using SlashCommandBuilder.');
        }

        const json = command.toJSON();
        assert(json && typeof json === 'object', 'Invalid command object. Ensure it is built using SlashCommandBuilder.');

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
        env: { PUBLIC_KEY: string },
        ctx: any,
    ) {
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
                            await command.execute(interaction);
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

    
}

export default Client;