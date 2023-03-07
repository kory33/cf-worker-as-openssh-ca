import { Request } from "@cloudflare/workers-types";
import { Env } from "..";
import { AuthoritySSHKeyPairStore, KeyPairGenerator, PrincipalsAuthenticator, Signer, SSHKeyPairFormatter, KeyTypes, PublicKey } from "../models";
import { ecdsaP521Signer, ecdsaP521Generator, ed25519PublicKeyToOpenSSHPublicKeyFormat, ed25519KeyPairToOpenSSHPrivateKeyFileFormat } from "./crypto";
import { keyPairStoreFrom, principalsAuthenticatorFrom } from "./intra-cloudflare";

export type AdaptedEntities = {
  readonly signer: Signer<"Ed25519">;
  readonly keyPairGenerator: KeyPairGenerator<"Ed25519">;
  readonly formatter: SSHKeyPairFormatter<"Ed25519", "Ed25519">;
  readonly keyPairStore: AuthoritySSHKeyPairStore<"Ed25519">;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: ecdsaP521Signer,
    keyPairGenerator: ecdsaP521Generator,
    formatter: ({
      inOpenSSHPublicKeyFormat: ed25519PublicKeyToOpenSSHPublicKeyFormat,
      inOpenSSHPrivateKeyFileFormat: ed25519KeyPairToOpenSSHPrivateKeyFileFormat,
    }),
    keyPairStore: keyPairStoreFrom("Ed25519", env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}
