import { JWTPayload } from "jose";

export const conformsTo = (expectation: Record<string, string | number | undefined>) => (claim: JWTPayload) => {
  for (const [k, v] of Object.entries(expectation)) {
    if (claim[k] !== v) {
      return false;
    }
  }
  return true;
}
