import { Fetcher, KVNamespace, Request } from "@cloudflare/workers-types";
import { Env } from ".";
import { AuthoritySSHKeyPairStore, SSHKeyPairGenerator, PrincipalsAuthenticator, Signer } from "./models";

function signerFrom(env: Env): Signer {
  throw "TODO: not implemented."
}

function generatorFrom(env: Env): SSHKeyPairGenerator {
  throw "TODO: not implemented."
}

function keyPairStoreFrom(signing: KVNamespace): AuthoritySSHKeyPairStore {
  throw "TODO: not implemented."
}

function principalsAuthenticatorFrom(authenticatorService: Fetcher): PrincipalsAuthenticator<Request> {
  throw "TODO: not implemented."
}

export type AdaptedEntities = {
  readonly signer: Signer;
  readonly keyPairGenerator: SSHKeyPairGenerator;
  readonly keyPairStore: AuthoritySSHKeyPairStore;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: signerFrom(env),
    keyPairGenerator: generatorFrom(env),
    keyPairStore: keyPairStoreFrom(env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}
