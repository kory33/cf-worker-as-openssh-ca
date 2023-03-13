import { AppParameters, appParametersFrom } from "./app-params";
import { handleAllRequests } from "./route";

export interface Env {
	// Environment variables
	readonly JWKS_DISTRIBUTION_URL: string | undefined;
	readonly JWT_CLAIM_EXPECTATION_JSON: string | undefined;
	readonly PRINCIPAL_NAME_TO_AUTHORIZE: string | undefined;
}

const toAppParams = (env: Env): AppParameters => appParametersFrom(
	env.JWKS_DISTRIBUTION_URL,
	env.JWT_CLAIM_EXPECTATION_JSON,
	env.PRINCIPAL_NAME_TO_AUTHORIZE
);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleAllRequests(request, toAppParams(env))
	},
};
