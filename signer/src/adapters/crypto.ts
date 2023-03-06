import { Env } from "..";
import { Signer, KeyTypes, PublicKey, KeyPair, Principals, Certificate, KeyPairGenerator, SSHKeyPairFormatter, PrivateKey } from "../models";

export const signerFrom = (env: Env): Signer<KeyTypes.ECDSA_P521> => ({
  signShortLived: async <UserKeyType>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<KeyTypes.ECDSA_P521>,
    principals: Principals
  ): Promise<Certificate> => {
    throw "TODO: Not implemented!";
  }
});

export const generatorFrom = (env: Env): KeyPairGenerator<KeyTypes.ECDSA_P521> => ({
  secureGenerate: async (): Promise<KeyPair<KeyTypes.ECDSA_P521>> => {
    throw "TODO: Not implemented!";
  }
});

export const sshKeyPairFormatterFrom = (env: Env): SSHKeyPairFormatter<KeyTypes.ECDSA_P521, KeyTypes.ECDSA_P521> => ({
  inOpenSSHPublicKeyFormat: async (publicKey: PublicKey<KeyTypes.ECDSA_P521>): Promise<string> => {
    throw "TODO: Not implemented!";
  },
  inOpenSSHPrivateKeyFileFormat: async (privateKey: PrivateKey<KeyTypes.ECDSA_P521>): Promise<string> => {
    throw "TODO: Not implemented!";
  },
});
