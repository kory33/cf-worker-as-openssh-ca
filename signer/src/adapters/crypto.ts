import { Signer, KeyTypes, PublicKey, KeyPair, Principals, Certificate, KeyPairGenerator, PrivateKey } from "../models";

export const ecdsaP521Signer: Signer<KeyTypes.ECDSA_P521> = ({
  signShortLived: async <UserKeyType>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<KeyTypes.ECDSA_P521>,
    principals: Principals
  ): Promise<Certificate> => {
    throw "TODO: Not implemented!";
  }
});

export const ecdsaP521Generator: KeyPairGenerator<KeyTypes.ECDSA_P521> = ({
  secureGenerate: async (): Promise<KeyPair<KeyTypes.ECDSA_P521>> => {
    throw "TODO: Not implemented!";
  }
});

export async function ecdsaP521PublicKeyToOpenSSHPublicKeyFormat(publicKey: PublicKey<KeyTypes.ECDSA_P521>): Promise<string> {
  throw "TODO: Not implemented!";
}

export async function ecdsaP521PrivateKeyToOpenSSHPrivateKeyFileFormat(privateKey: PrivateKey<KeyTypes.ECDSA_P521>): Promise<string> {
  throw "TODO: Not implemented!";
}
