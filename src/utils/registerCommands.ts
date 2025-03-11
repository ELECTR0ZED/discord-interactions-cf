import fs from 'fs';
import path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

/**
 * Registers all commands with Discord from the specified directory.
 */
async function registerCommands(commandsDir: string, token: string, clientId: string, guildId?: string) {
    if (!token || !clientId) {
        throw new Error('Missing required parameters for command registration.');
    }

    const commandFiles = fs.readdirSync(commandsDir)
        .filter(file => (file.endsWith('.ts') || file.endsWith('.js')) && file !== 'index.ts');

    const commands = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsDir, file);
        const commandModule = await import(filePath);
        const command = commandModule.default;

        if (command && typeof command === 'object' && 'setExecute' in command) {
            commands.push(command.toJSON()); // Convert command to JSON format
            console.log(`Loaded command: ${command.name}`);
        } else {
            console.warn(`Skipping invalid command file: ${file}`);
        }
    }

    if (commands.length === 0) {
        console.warn('No valid commands found to register.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(token);
    
    try {
        console.log(`Registering ${commands.length} commands...`);
        
        const route = guildId
            ? Routes.applicationGuildCommands(clientId, guildId!)
            : Routes.applicationCommands(clientId);
        
        await rest.put(route, { body: commands });

        console.log(`Successfully registered ${commands.length} commands.`);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

export { registerCommands };
