import { Signer, KeyTypes, PublicKey, KeyPair, Principals, Certificate, KeyPairGenerator, OpenSSHPublicKeyFormatter, OpenSSHPrivateKeyFormatter } from "../models";
import * as internalWasm from "signer-internal-crypto-wasm";

const fromKeyPairToWasmKeys = (keyPair: KeyPair<"Ed25519">): internalWasm.RawEd25519Keys =>
  new internalWasm.RawEd25519Keys(keyPair.publicKey.raw, keyPair.privateKey.raw)

const fromWasmKeysToKeyPair = (wasmKeyPair: internalWasm.RawEd25519Keys): KeyPair<"Ed25519"> => ({
  publicKey: {
    type: "Ed25519",
    raw: wasmKeyPair.get_public()
  },
  privateKey: {
    type: "Ed25519",
    raw: wasmKeyPair.get_unencrypted_private()
  }
});

let wasmHasBeenInitialized = false;
const withSharedWasmModule = <R>(producer: () => R) => (module: WebAssembly.Module): R => {
  if (!wasmHasBeenInitialized) {
    internalWasm.initSync(module)
    wasmHasBeenInitialized = true;
  }
  return producer();
};

const withWebCrypto = <R>(producer: (c: Crypto) => R) => (crypto: Crypto) => producer(crypto);

export const wasmEd25519Signer = withSharedWasmModule(() => withWebCrypto((crypto: Crypto): Signer<"Ed25519", "Ed25519"> => ({
  signCertificate: async(
    targetKey: PublicKey<"Ed25519">,
    authorityKeyPair: KeyPair<"Ed25519">,
    principals: Principals,
    valid_after: bigint,
    valid_before: bigint,
  ): Promise<Certificate> => ({
    openSSHCertificateString: internalWasm.sign_ed25519_public_key_with_ed25519_key_pair(
      crypto,
      targetKey.raw,
      fromKeyPairToWasmKeys(authorityKeyPair),
      principals,
      valid_after,
      valid_before
    )
  })
})));

export const wasmEd25519Generator = withSharedWasmModule(() => withWebCrypto((crypto: Crypto): KeyPairGenerator<"Ed25519"> => ({
  secureGenerate: async (): Promise<KeyPair<"Ed25519">> =>
    fromWasmKeysToKeyPair(internalWasm.ed25519_generate(crypto))
})));

export const wasmEd25519PublicKeyToOpenSSHPublicKeyFormat = withSharedWasmModule((): OpenSSHPublicKeyFormatter<"Ed25519"> => ({
  formatPublicKeyToOpenSSH: (publicKey: PublicKey<"Ed25519">): Promise<string> =>
    Promise.resolve(internalWasm.ed25519_public_key_to_openssh_public_key_format(publicKey.raw))
}));

export const wasmEd25519KeyPairToOpenSSHPrivateKeyFileFormat = withSharedWasmModule((): OpenSSHPrivateKeyFormatter<"Ed25519"> => ({
  formatPrivateKeyToOpenSSH: (keyPair: KeyPair<"Ed25519">): Promise<string> =>
    Promise.resolve(internalWasm.ed25519_key_pair_to_openssh_pem_private_key(fromKeyPairToWasmKeys(keyPair)))
}));
