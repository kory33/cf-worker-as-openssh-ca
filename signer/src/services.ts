import { KeyPairGenerator, AuthoritySSHKeyPairStore, PublicKey, PrincipalsAuthenticator, Signer, PrivateKey, Certificate, KeyTypes } from "./models";

export async function ensureKeyPairIsInRepositoryAndGetPublicKey<KeyType extends KeyTypes>(
  generator: KeyPairGenerator<KeyType>,
  store: AuthoritySSHKeyPairStore<KeyType>
): Promise<PublicKey<KeyType>> {
  const currentKeyPair = await store.getStoredKeyPair();

  if (currentKeyPair === null) {
    const newKeyPair = await generator.secureGenerate();
    await store.store(newKeyPair);
    return newKeyPair.publicKey;
  } else {
    return currentKeyPair.publicKey;
  }
}

export type SignedKeyPairGenerationResult<KeyType extends KeyTypes> = {
  __tag: 'Success',
  privateKey: PrivateKey<KeyType>,
  signedShortLivedCertificate: Certificate,
} | {
  __tag: "NoCAKeyPair"
} | {
  __tag: "EmptyPrincipals"
}

export async function generateSignedKeyPairUsingStoredCAKeyPair<
  Req,
  ClientKeyType extends KeyTypes,
  AuthorityKeyType extends KeyTypes
>(
  clonedRequest: Req,
  store: AuthoritySSHKeyPairStore<AuthorityKeyType>,
  authenticator: PrincipalsAuthenticator<Req>,
  generator: KeyPairGenerator<ClientKeyType>,
  signer: Signer<AuthorityKeyType>
): Promise<SignedKeyPairGenerationResult<ClientKeyType>> {
  const caKeyPair = await store.getStoredKeyPair();
  if (caKeyPair === null) {
    // Design decision: we want to return an error here because
    // somebody should have generated CA key pair in another GET request to /ca-public-key.
    // Cf Workers KV has a weak consistency guarantee so we will not
    // generate a key pair here to avoid potential confusion.
    return ({ __tag: "NoCAKeyPair" });
  }

  const principals = await authenticator.validPrincipalsFor(clonedRequest);
  if (principals.length === 0) {
    return ({ __tag: "EmptyPrincipals" });
  }

  const keyPair = await generator.secureGenerate();
  const certificate = await signer.signShortLived(keyPair.publicKey, caKeyPair, principals);

  return ({
    __tag: "Success",
    privateKey: keyPair.privateKey,
    signedShortLivedCertificate: certificate
  });
}
