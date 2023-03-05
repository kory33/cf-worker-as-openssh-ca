import { SSHKeyPairGenerator, AuthoritySSHKeyPairStore, PublicSSHKey, PrincipalsAuthenticator, Signer, PrivateSSHKey, Certificate } from "./models";

export async function ensureKeyPairIsInRepositoryAndGetPublicKey(
  generator: SSHKeyPairGenerator,
  store: AuthoritySSHKeyPairStore
): Promise<PublicSSHKey> {
  const currentKeyPair = await store.getStoredKeyPair();

  if (currentKeyPair === null) {
    const newKeyPair = await generator.secureGenerate();
    await store.store(newKeyPair);
    return newKeyPair.publicKey;
  } else {
    return currentKeyPair.publicKey;
  }
}

export type SignedKeyPairGenerationResult = {
  __tag: 'Success',
  privateKey: PrivateSSHKey,
  signedShortLivedCertificate: Certificate,
} | {
  __tag: "NoCAKeyPair"
} | {
  __tag: "EmptyPrincipals"
}

export async function generateSignedKeyPairUsingStoredCAKeyPair<Req>(
  clonedRequest: Req,
  store: AuthoritySSHKeyPairStore,
  authenticator: PrincipalsAuthenticator<Req>,
  generator: SSHKeyPairGenerator,
  signer: Signer
): Promise<SignedKeyPairGenerationResult> {
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
