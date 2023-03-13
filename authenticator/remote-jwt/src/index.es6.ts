import { AppParameters, handleAllRequests } from "./route";

export interface Env {
	// Environment variables

	/** The URL at which the public key of the signer is distributed */
	readonly JWKS_DISTRIBUTION_URL: string | undefined;

	/**
	 * The Eta template string that produces
	 * a comma-separated nonempty list of principal strings
	 * when run on the JWT claim
	 */
	readonly ETA_TEMPLATE_FOR_PRINCIPALS: string | undefined;
}

const toAppParams = (env: Env): AppParameters => ({
	jwksDistributionUrl: env.JWKS_DISTRIBUTION_URL,
	etaTemplateForPrincipals: env.ETA_TEMPLATE_FOR_PRINCIPALS,
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleAllRequests(request, toAppParams(env))
	},
};
