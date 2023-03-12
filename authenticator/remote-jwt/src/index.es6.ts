import * as jose from "jose";
import * as Eta from "eta";

export interface Env {
	// Environment variables

	/** The URL at which the public key of the signer is distributed */
	readonly JWKS_DISTRIBUTION_URL: string;

	/**
	 * The Eta template string that produces
	 * a comma-separated nonempty list of principal strings
	 * when run on the JWT claim
	 */
	readonly ETA_TEMPLATE_FOR_PRINCIPALS: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// We expect a header Authorization: Bearer <JWT>
		// so immediately return an empty array if not given such a header
		const authHeader = request.headers.get("Authorization");
		if (authHeader === null || !authHeader.startsWith("Bearer ")) {
			return Response.json([]);
		}

		const token = authHeader.slice("Bearer ".length);
		const jwks = jose.createRemoteJWKSet(new URL(env.JWKS_DISTRIBUTION_URL));
		const { payload } = await jose.jwtVerify(token, jwks);
		const commaSeparatedPrincipals = Eta.render(env.ETA_TEMPLATE_FOR_PRINCIPALS, payload);
		const principals = commaSeparatedPrincipals.split(",");

		return Response.json(principals);
	},
};
