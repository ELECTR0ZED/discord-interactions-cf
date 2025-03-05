import { APIInteraction, APIInteractionResponsePong, InteractionResponseType, InteractionType } from "discord-api-types/v10";
import verifyKey from "../helpers/verifyKey";

class Client {
    publicKey: string;
    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    async fetch(
        request: Request,
        env: any,
        ctx: any,
    ) {
        console.log('Interaction Received');

        const body = await request.text();
        const headers = request.headers;
        const verified = await verifyKey(headers, body, this.publicKey);

        if (!verified) {
            return {
                status: 401,
                body: JSON.stringify({ message: "Invalid request" }),
            };
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