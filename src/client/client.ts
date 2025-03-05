import { APIInteraction, APIInteractionResponsePong, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";

class Client {
    constructor() {}

    async fetch(
        request: Request,
        env: { PUBLIC_KEY: string },
        ctx: any,
    ) {
        console.log('Interaction Received');

        const body = await request.text();
        const headers = request.headers;
        const verified = await verifyKey(headers, body, env.PUBLIC_KEY);

        if (!verified) {
            return new Response('Invalid request signature', {
                status: 401,
            });
        }

        const interaction = JSON.parse(body) as APIInteraction;

        if (interaction.type === InteractionType.Ping) {
            const response: APIInteractionResponsePong = {
                type: InteractionResponseType.Pong,
            };

            return new Response(JSON.stringify(response), {
                status: 200,
            });
        }
    }
}

export default Client;