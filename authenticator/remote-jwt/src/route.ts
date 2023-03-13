import * as jose from "jose";
import * as Eta from "eta";

export type AppParameters = {
	/** The URL at which the public key of the signer is distributed */
  readonly jwksDistributionUrl: string | undefined;

	/**
	 * The Eta template string that produces
	 * a comma-separated nonempty list of principal strings
	 * when run on the JWT claim
	 */
  readonly etaTemplateForPrincipals: string | undefined;
}

export async function handleAllRequests(request: Request, params: AppParameters): Promise<Response> {
  if (params.jwksDistributionUrl === undefined) {
    return new Response("JWKS distribution url not set.", { status: 500 });
  } else if (params.etaTemplateForPrincipals === undefined) {
    return new Response("Eta template string not set.", { status: 500 });
  }

  // We expect a header Authorization: Bearer <JWT>
  // so immediately return an empty array if not given such a header
  const authHeader = request.headers.get("Authorization");
  if (authHeader === null || !authHeader.startsWith("Bearer ")) {
    return Response.json([]);
  }

  const token = authHeader.slice("Bearer ".length);
  const jwks = jose.createRemoteJWKSet(new URL(params.jwksDistributionUrl));
  const { payload } = await jose.jwtVerify(token, jwks);
  const commaSeparatedPrincipals = Eta.render(params.etaTemplateForPrincipals, payload);
  const principals = commaSeparatedPrincipals.split(",");

  return Response.json(principals);
}
