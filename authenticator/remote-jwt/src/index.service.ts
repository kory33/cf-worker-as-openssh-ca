import { appParametersFrom } from "./app-params";
import { handleAllRequests } from "./route";

declare const JWKS_DISTRIBUTION_URL: string;
declare const JWT_CLAIM_EXPECTATION_JSON: string;
declare const PRINCIPAL_NAME_TO_AUTHORIZE: string;

const appParameters = appParametersFrom(
  JWKS_DISTRIBUTION_URL,
  JWT_CLAIM_EXPECTATION_JSON,
  PRINCIPAL_NAME_TO_AUTHORIZE
);

addEventListener("fetch", event => {
  event.respondWith(handleAllRequests(event.request, appParameters))
});
