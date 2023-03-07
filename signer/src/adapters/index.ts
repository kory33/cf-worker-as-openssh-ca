import { Request } from "@cloudflare/workers-types";
import { Env } from "..";
import { AuthoritySSHKeyPairStore, KeyPairGenerator, PrincipalsAuthenticator, Signer, SSHKeyPairFormatter, KeyTypes, PublicKey } from "../models";
import { ecdsaP521Signer, ecdsaP521Generator, ecdsaP521PublicKeyToOpenSSHPublicKeyFormat, ecdsaP521PrivateKeyToOpenSSHPrivateKeyFileFormat } from "./crypto";
import { keyPairStoreFrom, principalsAuthenticatorFrom } from "./intra-cloudflare";

export type AdaptedEntities = {
  readonly signer: Signer<"ECDSA-P521">;
  readonly keyPairGenerator: KeyPairGenerator<"ECDSA-P521">;
  readonly formatter: SSHKeyPairFormatter<"ECDSA-P521", "ECDSA-P521">;
  readonly keyPairStore: AuthoritySSHKeyPairStore<"ECDSA-P521">;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: ecdsaP521Signer,
    keyPairGenerator: ecdsaP521Generator,
    formatter: ({
      inOpenSSHPublicKeyFormat: ecdsaP521PublicKeyToOpenSSHPublicKeyFormat,
      inOpenSSHPrivateKeyFileFormat: ecdsaP521PrivateKeyToOpenSSHPrivateKeyFileFormat,
    }),
    keyPairStore: keyPairStoreFrom("ECDSA-P521", env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}
