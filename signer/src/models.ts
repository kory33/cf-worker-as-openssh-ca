export type PublicSSHKey = {
  raw(): Uint8Array;
  asSSHPublicKeyString(): string;
};

export type PrivateSSHKey = {
  raw(): Uint8Array;
  asSSHPrivateKeyFileString(): string;
};

export type SSHKeyPair = {
  readonly publicKey: PublicSSHKey;
  readonly privateKey: PrivateSSHKey;
};

export type SSHKeyPairGenerator = {
  secureGenerate(): Promise<SSHKeyPair>;
};

export type AuthoritySSHKeyPairStore = {
  getStoredKeyPair(): Promise<SSHKeyPair | null>;
  store(authoritySSHKeyPair: SSHKeyPair): Promise<void>;
};

export type Principals = string[];

export type PrincipalsAuthenticator<Req> = {
  validPrincipalsFor(clonedRequest: Req): Promise<Principals>;
};

export type Certificate = {
  asBase64String(): string;
};

export type Signer = {
  signShortLived(targetKey: PublicSSHKey, authorityKeyPair: SSHKeyPair, principals: Principals): Promise<Certificate>
};
