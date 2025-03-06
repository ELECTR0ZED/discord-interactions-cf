import Client from "../client/client";

class Base {
	readonly client: Client;

	constructor(client: Client) {
		this.client = client;
	}
}

export { Base };