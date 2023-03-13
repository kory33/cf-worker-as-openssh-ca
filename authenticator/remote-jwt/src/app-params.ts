export type AppParameters = {
  /** The URL at which the public key of the signer is distributed */
  readonly jwksDistributionUrl: URL;

	/**
	 * A flat object to which the claim of an incoming JWT
   * should match in order to be authenticated
   * 
   * A JWT claim object `c` matches jwtClaimExpectation if
   * for every key-value pair `<k, v>` of jwtClaimExpectation,
   * `c[k] === v`.
	 */
  readonly jwtClaimExpectation: Record<string, string | number | undefined>;

  /**
   * The principal name to be authorized when jwtClaimExpectation
   * matches the claim of successfully validated JWT
   */
  readonly principalNameToAuthorize: string
}

export const appParametersFrom = (
  jwksDistributionUrl: string | undefined,
  jwtClaimExpectationJson: string | undefined,
  principalNameToAuthorize: string | undefined,
): AppParameters => {
  if (jwksDistributionUrl === undefined) {
    throw "JWKS distribution url not set";
  }
  
  if (jwtClaimExpectationJson === undefined) {
    throw "JWT claim expectation not set";
  }
  const jwtClaimExpectation = JSON.parse(jwtClaimExpectationJson) as unknown;
  if (typeof jwtClaimExpectation !== "object" || jwtClaimExpectation === null) {
    throw "JWT claim expectation is not an object";
  }
  for (const [k, v] of Object.entries(jwtClaimExpectation)) {
    if (typeof v !== "string" && typeof v !== "number") {
      throw `JWT claim expectation contains a value ${v} at ${k}, expected number of string.`;
    }
  }

  if (principalNameToAuthorize === undefined) {
    throw "\"Principal name to authorize\" not set."
  }

  return ({
    jwksDistributionUrl: new URL(jwksDistributionUrl),
    jwtClaimExpectation: jwtClaimExpectation as Record<string, string | number | undefined>,
    principalNameToAuthorize,
  });
}
