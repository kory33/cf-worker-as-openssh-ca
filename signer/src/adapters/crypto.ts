import { Signer, KeyTypes, PublicKey, KeyPair, Principals, Certificate, KeyPairGenerator, PrivateKey } from "../models";

export const ecdsaP521Signer: Signer<"ECDSA-P521"> = ({
  signShortLived: async <UserKeyType extends KeyTypes>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<"ECDSA-P521">,
    principals: Principals
  ): Promise<Certificate> => {
    throw "TODO: Not implemented!";
  }
});

export const ecdsaP521Generator: KeyPairGenerator<"ECDSA-P521"> = ({
  secureGenerate: async (): Promise<KeyPair<"ECDSA-P521">> => {
    throw "TODO: Not implemented!";
  }
});

export async function ecdsaP521PublicKeyToOpenSSHPublicKeyFormat(publicKey: PublicKey<"ECDSA-P521">): Promise<string> {
  throw "TODO: Not implemented!";
}

export async function ecdsaP521PrivateKeyToOpenSSHPrivateKeyFileFormat(privateKey: PrivateKey<"ECDSA-P521">): Promise<string> {
  throw "TODO: Not implemented!";
}
