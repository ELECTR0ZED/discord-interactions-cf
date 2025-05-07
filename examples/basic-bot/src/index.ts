import { Client } from '@electr0zed/discord-interactions-cf';

import ping from './commands/ping';
import hello from './commands/hello';
import worldComponent from './components/world';

const client = new Client();

client.addCommand(ping);
client.addCommand(hello);

client.addComponent(worldComponent);

export default client;
