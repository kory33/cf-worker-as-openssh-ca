import { AppEntities } from "./models";
import { keyPairStoreFrom } from "./adapters/cloudflare-keypair-store";
import { principalsAuthenticatorFrom } from "./adapters/cloudflare-principals-auth";
import { wasmEd25519Signer, wasmEd25519Generator, wasmEd25519PublicKeyToOpenSSHPublicKeyFormat, wasmEd25519KeyPairToOpenSSHPrivateKeyFileFormat } from "./adapters/wasm-crypto";
import * as routes from "./routes";

export interface Env {
  /**
   * The KV namespace in which a signing key pair should be stored.
   */
  SIGNING_KEY_PAIR_NAMESPACE: KVNamespace;

  /**
   * The Service that is able to verify a request and return a list of principals.
   * 
   * The service bound to this variable MUST return a 200 response with a JSON body
   * that contains a single array containing the "principal names" for which
   * the request is valid. If the request cannot be authenticated, an empty array MUST
   * be returned.
   */
  AUTHENTICATOR_SERVICE: Fetcher;
}

// Cloudflare injects a WASM module here at runtime
import wasmModule from "../internal-crypto-wasm/pkg/signer_internal_crypto_bg.wasm";

function adapt(env: Env): AppEntities<Request, "Ed25519", "Ed25519"> {
  return ({
    signer: wasmEd25519Signer(wasmModule)(crypto),
    authorityKeyPairGenerator: wasmEd25519Generator(wasmModule)(crypto),
    clientKeyPairGenerator: wasmEd25519Generator(wasmModule)(crypto),
    authorityKeyFormatter: wasmEd25519PublicKeyToOpenSSHPublicKeyFormat(wasmModule),
    clientKeyFormatter: wasmEd25519KeyPairToOpenSSHPrivateKeyFileFormat(wasmModule),
    authorityKeyPairStore: keyPairStoreFrom("Ed25519", env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const adapted = adapt(env);

    if (request.method === "GET" && url.pathname === "/ca-public-key") {
      return await routes.getCaPublicKey(adapted);
    } else if (request.method === "POST" && url.pathname === "/new-short-lived-certificate") {
      return await routes.postNewShortLivedCertificate(request.clone(), adapted);
    } else {
      return new Response(null, { status: 404 });
    }
  },
};
