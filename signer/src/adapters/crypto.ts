import { Signer, KeyTypes, PublicKey, KeyPair, Principals, Certificate, KeyPairGenerator, PrivateKey } from "../models";
import * as wasm from "../../internal-crypto-wasm/pkg/signer_internal_crypto";

const fromKeyPairToWasmKeys = (keyPair: KeyPair<"Ed25519">): wasm.RawEd25519Keys =>
  new wasm.RawEd25519Keys(keyPair.publicKey.raw, keyPair.privateKey.raw)

const fromWasmKeysToKeyPair = (wasmKeyPair: wasm.RawEd25519Keys): KeyPair<"Ed25519"> => ({
  publicKey: {
    type: "Ed25519",
    raw: wasmKeyPair.get_public()
  },
  privateKey: {
    type: "Ed25519",
    raw: wasmKeyPair.get_unencrypted_private()
  }
});

export const ecdsaP521Signer: Signer<"Ed25519"> = ({
  signCertificate: async <UserKeyType extends KeyTypes>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<"Ed25519">,
    principals: Principals,
    valid_after: bigint,
    valid_before: bigint,
  ): Promise<Certificate> => ({
    openSSHCertificateString: wasm.sign_ed25519_public_key_with_ed25519_key_pair(
      targetKey.raw,
      fromKeyPairToWasmKeys(authorityKeyPair),
      principals,
      valid_after,
      valid_before
    )
  })
});

export const ecdsaP521Generator: KeyPairGenerator<"Ed25519"> = ({
  secureGenerate: async (): Promise<KeyPair<"Ed25519">> =>
    fromWasmKeysToKeyPair(wasm.ed25519_generate())
});

export async function ed25519PublicKeyToOpenSSHPublicKeyFormat(publicKey: PublicKey<"Ed25519">): Promise<string> {
  return wasm.ed25519_public_key_to_openssh_public_key_format(publicKey.raw)
}

export async function ed25519KeyPairToOpenSSHPrivateKeyFileFormat(keyPair: KeyPair<"Ed25519">): Promise<string> {
  return wasm.ed25519_key_pair_to_openssh_pem_private_key(fromKeyPairToWasmKeys(keyPair))
}
