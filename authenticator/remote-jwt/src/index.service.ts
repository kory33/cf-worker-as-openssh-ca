import * as jose from "jose";
import * as Eta from "eta";

declare const JWKS_DISTRIBUTION_URL: string;

declare const ETA_TEMPLATE_FOR_PRINCIPALS: string;

//#region entrypoint
async function handler(request: Request): Promise<Response> {
		// We expect a header Authorization: Bearer <JWT>
		// so immediately return an empty array if not given such a header
		const authHeader = request.headers.get("Authorization");
		if (authHeader === null || !authHeader.startsWith("Bearer ")) {
			return Response.json([]);
		}

		const token = authHeader.slice("Bearer ".length);
		const jwks = jose.createRemoteJWKSet(new URL(JWKS_DISTRIBUTION_URL));
		const { payload } = await jose.jwtVerify(token, jwks);
		const commaSeparatedPrincipals = Eta.render(ETA_TEMPLATE_FOR_PRINCIPALS, payload);
		const principals = commaSeparatedPrincipals.split(",");

		return Response.json(principals);
}

addEventListener("fetch", event => {
  event.respondWith(handler(event.request))
});
//#endregion