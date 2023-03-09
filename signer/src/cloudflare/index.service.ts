/**
 * The signer Worker in Service Worker syntax.
 * At the time of writing (2023/03/09), this is the only syntax
 * that can be deployed (together with a WASM module) using Terraform.
 * 
 * https://developers.cloudflare.com/workers/learning/service-worker/
 */

import { AppEntities, UnixTime } from "../core/models";
import { keyPairStoreFrom } from "./adapters/cloudflare-keypair-store";
import { principalsAuthenticatorFrom } from "./adapters/cloudflare-principals-auth";
import { wasmEd25519Signer, wasmEd25519Generator, wasmEd25519PublicKeyToOpenSSHPublicKeyFormat, wasmEd25519KeyPairToOpenSSHPrivateKeyFileFormat } from "./adapters/cloudflare-wasm-crypto";
import * as routes from "./routes";

//#region global bindings
/**
 * The KV namespace in which a signing key pair should be stored.
 */
declare const SIGNING_KEY_PAIR_NAMESPACE: KVNamespace;

/**
 * The Service that is able to verify a request and return a list of principals.
 * 
 * The service bound to this variable MUST return a 200 response with a JSON body
 * that contains a single array containing the "principal names" for which
 * the request is valid. If the request cannot be authenticated, an empty array MUST
 * be returned.
 */
declare const AUTHENTICATOR_SERVICE: Fetcher;

/**
 * The duration through which the issued certificate remains valid,
 * specified in the number of seconds. The default value is 60.
 */
declare const ISSUED_CERTIFICATE_VALIDITY_IN_SECONDS: string | undefined;
const issuedCertificateValidityInSeconds = (): UnixTime =>
  ISSUED_CERTIFICATE_VALIDITY_IN_SECONDS !== undefined
    ? BigInt(ISSUED_CERTIFICATE_VALIDITY_IN_SECONDS)
    : 60n;

/**
 * The WASM module binding to which internal-crypto-wasm should be bound.
 */
declare const INTERNAL_CRYPTO_WASM_MODULE: WebAssembly.Module;
//#endregion

const adapt = (): AppEntities<Request, "Ed25519", "Ed25519"> => ({
  signer: wasmEd25519Signer(INTERNAL_CRYPTO_WASM_MODULE)(crypto),
  authorityKeyPairGenerator: wasmEd25519Generator(INTERNAL_CRYPTO_WASM_MODULE)(crypto),
  clientKeyPairGenerator: wasmEd25519Generator(INTERNAL_CRYPTO_WASM_MODULE)(crypto),
  authorityKeyFormatter: wasmEd25519PublicKeyToOpenSSHPublicKeyFormat(INTERNAL_CRYPTO_WASM_MODULE),
  clientKeyFormatter: wasmEd25519KeyPairToOpenSSHPrivateKeyFileFormat(INTERNAL_CRYPTO_WASM_MODULE),
  authorityKeyPairStore: keyPairStoreFrom("Ed25519", SIGNING_KEY_PAIR_NAMESPACE),
  authenticator: principalsAuthenticatorFrom(AUTHENTICATOR_SERVICE),
})

//#region entrypoint
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const adapted = adapt();

  if (request.method === "GET" && url.pathname === "/ca-public-key") {
    return await routes.getCaPublicKey(adapted);
  } else if (request.method === "POST" && url.pathname === "/new-short-lived-certificate") {
    return await routes.postNewShortLivedCertificate(request.clone(), issuedCertificateValidityInSeconds(), adapted);
  } else {
    return new Response(null, { status: 404 });
  }
}

addEventListener("fetch", event => {
  event.respondWith(handler(event.request))
});
//#endregion