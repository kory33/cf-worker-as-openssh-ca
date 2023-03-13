import { AppParameters, handleAllRequests } from "./route";

declare const JWKS_DISTRIBUTION_URL: string;
declare const ETA_TEMPLATE_FOR_PRINCIPALS: string;

const parameters: AppParameters = {
  jwksDistributionUrl: JWKS_DISTRIBUTION_URL,
  etaTemplateForPrincipals: ETA_TEMPLATE_FOR_PRINCIPALS,
}

addEventListener("fetch", event => {
  event.respondWith(handleAllRequests(event.request, parameters))
});
