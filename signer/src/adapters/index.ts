import { Request } from "@cloudflare/workers-types";
import { Env } from "..";
import { AuthoritySSHKeyPairStore, KeyPairGenerator, PrincipalsAuthenticator, Signer, SSHKeyPairFormatter, KeyTypes } from "../models";
import { signerFrom, generatorFrom, sshKeyPairFormatterFrom } from "./crypto";
import { keyPairStoreFrom, principalsAuthenticatorFrom } from "./intra-cloudflare";

export type AdaptedEntities = {
  readonly signer: Signer<KeyTypes.ECDSA_P521>;
  readonly keyPairGenerator: KeyPairGenerator<KeyTypes.ECDSA_P521>;
  readonly formatter: SSHKeyPairFormatter<KeyTypes.ECDSA_P521, KeyTypes.ECDSA_P521>;
  readonly keyPairStore: AuthoritySSHKeyPairStore<KeyTypes.ECDSA_P521>;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: signerFrom(env),
    keyPairGenerator: generatorFrom(env),
    formatter: sshKeyPairFormatterFrom(env),
    keyPairStore: keyPairStoreFrom(env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}
