import { ExecutionContext, Fetcher, KVNamespace, Request, Response } from "@cloudflare/workers-types";
import * as routes from "./routes";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	/**
	 * The KV namespace in which a signing key pair should be stored.
	 */
	SIGNING_KEY_PAIR_NAMESPACE: KVNamespace;

	/**
	 * The Service that is able to verify a request and return a list of principals.
	 * 
	 * The service bound to this variable MUST:
	 * 
	 * - return a 200 response
	 *   - whenever the service deems that the request is successfully authenticated
	 *   - with the response body containing a single line of comma-separated nonempty list
	 *     of "principal names" (in character range [a-zA-Z0-9_-]) for which the request is valid
	 * - return a 401 response
	 *   - whenever the service deems that the request does not qualify for any principal
	 */
	AUTHENTICATOR_SERVICE: Fetcher;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === "GET" && url.pathname === "/ca-public-key") {
			return await routes.getCaPublicKey(request, env, ctx);
		} else if (request.method === "POST" && url.pathname === "/new-short-lived-certificate") {
			return await routes.postNewShortLivedCertificate(request, env, ctx);
		} else {
			return new Response(null, { status: 404 });
		}
	},
};
