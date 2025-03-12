import { REST } from '@discordjs/rest';
import { Routes, RESTPutAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

// Registers all commands with Discord from the specified directory.
async function registerCommands(commands: RESTPutAPIApplicationCommandsJSONBody, token: string, clientId: string, guildId?: string) {
    if (!token || !clientId) {
        throw new Error('Missing required parameters for command registration.');
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
