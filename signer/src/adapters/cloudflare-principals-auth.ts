import { PrincipalsAuthenticator, Principals } from "../models";

export const principalsAuthenticatorFrom =
  (authenticatorService: Fetcher): PrincipalsAuthenticator<Request> => ({
    validPrincipalsFor: async (clonedRequest: Request): Promise<Principals> => {
      const response = await authenticatorService.fetch(clonedRequest)
      
      if (!response.ok) {
        throw `Unexpected response status ${response.status} from authenticator.`
      }

      const json = await response.json<unknown>();
      if (!Array.isArray(json)) {
        throw "Received non-array value from authenticator.";
      }

      return json.map((x: unknown) => {
        if (typeof x === "string") return x;
        else throw "Received non-string value inside top-level array from authenticator.";
      });
    }
  })