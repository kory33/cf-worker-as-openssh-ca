import * as jose from "jose";
import { AppParameters } from "./app-params";
import { conformsTo } from "./conforms";

export async function handleAllRequests(request: Request, params: AppParameters): Promise<Response> {
  // We expect a header Authorization: Bearer <JWT>
  // so immediately return an empty array if not given such a header
  const authHeader = request.headers.get("Authorization");
  if (authHeader === null || !authHeader.startsWith("Bearer ")) {
    return Response.json([]);
  }

  const jwks = jose.createRemoteJWKSet(params.jwksDistributionUrl);
  const token = authHeader.slice("Bearer ".length);
  const { payload } = await jose.jwtVerify(token, jwks);
  const authorizedPrincipals = conformsTo(params.jwtClaimExpectation)(payload) ? [params.principalNameToAuthorize] : [];
  return Response.json(authorizedPrincipals);
}
