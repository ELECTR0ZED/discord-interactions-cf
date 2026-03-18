import { 
	APIInteraction,
	APIInteractionResponsePong,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	APIInteractionResponse,
} from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";
import { SlashCommandBuilder } from "../builders/SlashCommandBuilder";
import { BaseInteraction } from "../structures/BaseInteraction";
import { ModalSubmitInteraction } from "../structures/ModalSubmitInteraction";
import { SlashCommandComponentBuilder } from "../builders/SlashCommandComponentBuilder";
import { SlashCommandModalBuilder } from "../builders/SlashCommandModalBuilder";
import { REST, DefaultRestOptions } from '@discordjs/rest';
import { registerCommands } from "../utils/registerCommands";
import { ChatInputCommandInteraction } from "../structures/ChatInputCommandInteraction";
import { UserContextMenuCommandInteraction } from "../structures/UserContextMenuCommandInteraction";
import { MessageContextMenuCommandInteraction } from "../structures/MessageContextMenuCommandInteraction";
import { MessageComponentInteraction } from "../structures/MessageComponentInteraction";
import { AutocompleteInteraction } from "../structures/AutocompleteInteraction";
import { createInteraction } from "../handlers/createInteraction";
import handleChatInputApplicationCommand from "../handlers/ApplicationCommand/ChatInput";
import handleMessageComponent from "../handlers/MessageComponent";
import handleAutocomplete from "../handlers/Autocomplete";
import handleModalSubmit from "../handlers/ModalSubmit";
import handleContextMenuApplicationCommand from "../handlers/ApplicationCommand/ContextMenu";
import { ContextMenuCommandBuilder } from "../builders/ContextMenuCommandBuilder";

export type AnyInteraction = 
	| ChatInputCommandInteraction
	| UserContextMenuCommandInteraction
	| MessageContextMenuCommandInteraction
	| MessageComponentInteraction
	| AutocompleteInteraction
	| ModalSubmitInteraction;

export type Hook = (
	interaction: AnyInteraction,
	env: Env,
) => Promise<any> | any;

export type Hooks = {
	[key in InteractionType]: {
		before: Hook[];
		after: Hook[];
	}
}

export type ErrorHandler = (
	error: unknown,
	interaction: AnyInteraction,
	env: Env,
) => Promise<void> | void;

class Client {
	commands: Map<string, SlashCommandBuilder> = new Map();
	contextMenuCommands: Map<string, ContextMenuCommandBuilder> = new Map();
	components: Map<string, SlashCommandComponentBuilder> = new Map();
	modals: Map<string, SlashCommandModalBuilder> = new Map();
	customIdDelimiter = ':';
	private beforeAllHooks: Hook[] = [];
	private afterAllHooks: Hook[] = [];
	private hooks: Hooks = {
		[InteractionType.Ping]: { before: [], after: [] },
		[InteractionType.ApplicationCommand]: { before: [], after: [] },
		[InteractionType.MessageComponent]: { before: [], after: [] },
		[InteractionType.ApplicationCommandAutocomplete]: { before: [], after: [] },
		[InteractionType.ModalSubmit]: { before: [], after: [] },
	};
	private errorHandler?: ErrorHandler;

	constructor(customIdDelimiter?: string) {
		if (customIdDelimiter) {
			this.customIdDelimiter = customIdDelimiter;
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

	addContextMenu(command: ContextMenuCommandBuilder) {
		if (typeof command.toJSON !== 'function') {
			throw new Error('Invalid command object. Ensure it is built using ContextMenuCommandBuilder.');
		}

		const json = command.toJSON();
		if (json && typeof json !== 'object') {
			throw new Error('Invalid command object. Ensure it is built using ContextMenuCommandBuilder.');
		}

		if (!command.name) {
			throw new Error('Context menu command must have a name.');
		}

		if (this.contextMenuCommands.has(command.name)) {
			throw new Error(`Context menu command with name "${command.name}" already exists.`);
		}

		this.contextMenuCommands.set(command.name, command);

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

	addModal(modal: SlashCommandModalBuilder) {

		if (!modal.customId) {
			throw new Error('Modal must have a custom id.');
		}

		if (this.modals.has(modal.customId)) {
			throw new Error(`Modal with custom id "${modal.customId}" already exists.`);
		}

		this.modals.set(modal.customId, modal);

		return this;
	}

	addBeforeAllHook(fn: Hook) {
		this.beforeAllHooks.push(fn);
		return this;
	}
	addAfterAllHook(fn: Hook) {
		this.afterAllHooks.push(fn);
		return this;
	}

	addBeforeCommandHook(fn: Hook) {
		this.hooks[InteractionType.ApplicationCommand].before.push(fn);
		return this;
	}
	addAfterCommandHook(fn: Hook) {
		this.hooks[InteractionType.ApplicationCommand].after.push(fn);
		return this;
	}

	addBeforeComponentHook(fn: Hook) {
		this.hooks[InteractionType.MessageComponent].before.push(fn);
		return this;
	}
	addAfterComponentHook(fn: Hook) {
		this.hooks[InteractionType.MessageComponent].after.push(fn);
		return this;
	}

	addBeforeAutocompleteHook(fn: Hook) {
		this.hooks[InteractionType.ApplicationCommandAutocomplete].before.push(fn);
		return this;
	}
	addAfterAutocompleteHook(fn: Hook) {
		this.hooks[InteractionType.ApplicationCommandAutocomplete].after.push(fn);
		return this;
	}

	addBeforeModalHook(fn: Hook) {
		this.hooks[InteractionType.ModalSubmit].before.push(fn);
		return this;
	}
	addAfterModalHook(fn: Hook) {
		this.hooks[InteractionType.ModalSubmit].after.push(fn);
		return this;
	}

	setErrorHandler(fn: ErrorHandler) {
		this.errorHandler = fn;
		return this;
	}

	/**
	 * Run an array of hooks in sequence.  
	 * → If any returns (or resolves to) false, stop and return false.  
	 * → Otherwise return true.
	 */
	async runHooks(
		hooks: Hook[],
		interaction: AnyInteraction,
		env: Env,
	): Promise<boolean> {
		for (const hook of hooks) {
			try {
				const result = await Promise.resolve(hook(interaction, env));
				if (result === false) return false;
			} catch (error) {
				console.error('Error in hook:', error);
				return false; // Stop executing further hooks on error
			}
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
		const rawInteraction = JSON.parse(body) as APIInteraction;

		if (rawInteraction.application_id !== env.CLIENT_ID) {
			return new Response('Invalid application ID', {
				status: 401,
			});
		}

		// If the interaction is a ping, respond with a pong
		if (rawInteraction.type === InteractionType.Ping) {
			const response: APIInteractionResponsePong = {
				type: InteractionResponseType.Pong,
			};

			return new Response(JSON.stringify(response), {
				status: 200,
			});
		}

		const interaction = createInteraction(this, rawInteraction);
		if (!interaction) {
			console.error('Failed to create interaction from payload:', rawInteraction);
			return new Response('Bad Request', { status: 400 });
		}

		const beforeHooks = [...this.beforeAllHooks, ...this.hooks[interaction.type].before];
		const afterHooks = [...this.afterAllHooks, ...this.hooks[interaction.type].after];


		const beforeResult = await this.runHooks(beforeHooks, interaction, env);
		if (!beforeResult) {
			if (interaction.response) {
				return this.respond(interaction.response);
			}

			return new Response(null, { status: 200 });
		}

		try {
			await this.dispatchInteraction(interaction, env);
		} catch (error) {
			if (this.errorHandler) {
				try {
					await this.errorHandler(error, interaction, env);
					if (interaction.response) {
						return this.respond(interaction.response);
					}
					
					return new Response(null, { status: 200 });
				} catch (handlerError) {
					console.error('Error in error handler:', handlerError);
				}
			} else {
				throw error; // Re-throw if no error handler is set
			}
		}

		const afterResult = await this.runHooks(afterHooks, interaction, env);
		if (!afterResult) {
			if (interaction.response) {
				return this.respond(interaction.response);
			}

			return new Response(null, { status: 200 });
		}

		return this.respond(interaction.response);
	}

	private async dispatchInteraction(interaction: AnyInteraction, env: Env) {
		// Handle interaction types here
		switch (interaction.type) {
			case InteractionType.ApplicationCommand:
				switch (interaction.data.type) {
					case ApplicationCommandType.ChatInput:
						await handleChatInputApplicationCommand(this, interaction as ChatInputCommandInteraction, env);
						break;
					case ApplicationCommandType.User:
					case ApplicationCommandType.Message:
						await handleContextMenuApplicationCommand(this, interaction as UserContextMenuCommandInteraction|MessageContextMenuCommandInteraction, env);
						break;
					default:
						console.error('Unknown command type:', interaction.data.type);
						break;
				}
				break;
			case InteractionType.MessageComponent:
				// Handle message components
				await handleMessageComponent(this, interaction as MessageComponentInteraction, env);
				break;
			case InteractionType.ApplicationCommandAutocomplete:
				await handleAutocomplete(this, interaction as AutocompleteInteraction, env);
				break;
			case InteractionType.ModalSubmit:
				await handleModalSubmit(this, interaction as ModalSubmitInteraction, env);
				break;
			default:
				console.error('Unknown interaction type:', (interaction as BaseInteraction).type);
				break;
		}
	}

	async registerCommands(token: string, clientId: string) {
		const commands = Array.from(this.commands.values()).map(command => command.toJSON());
		const contextMenuCommands = Array.from(this.contextMenuCommands.values()).map(command => command.toJSON());
		
		await registerCommands([...commands, ...contextMenuCommands], token, clientId);
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