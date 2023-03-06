export namespace KeyTypes {
  export type ECDSA_P521 = "ECDSA-P521";
}

export type PublicKey<KeyType> = {
  readonly type: KeyType;
  raw(): Uint8Array;
};

export type PrivateKey<KeyType> = {
  readonly type: KeyType;
  raw(): Uint8Array;
};

export type KeyPair<KeyType> = {
  readonly publicKey: PublicKey<KeyType>;
  readonly privateKey: PrivateKey<KeyType>;
};

export type KeyPairGenerator<KeyType> = {
  secureGenerate(): Promise<KeyPair<KeyType>>;
};

export type SSHKeyPairFormatter<AuthorityKeyType, ClientKeyType> = {
  inOpenSSHPublicKeyFormat(publicKey: PublicKey<AuthorityKeyType>): Promise<string>;
  inOpenSSHPrivateKeyFileFormat(privateKey: PrivateKey<ClientKeyType>): Promise<string>;
}

export type AuthoritySSHKeyPairStore<KeyType> = {
  getStoredKeyPair(): Promise<KeyPair<KeyType> | null>;
  store(authoritySSHKeyPair: KeyPair<KeyType>): Promise<void>;
};

export type Principals = string[];

export type PrincipalsAuthenticator<Req> = {
  validPrincipalsFor(clonedRequest: Req): Promise<Principals>;
};

export type Certificate = {
  asBase64String(): string;
};

export type Signer<AuthorityKeyType> = {
  signShortLived<UserKeyType>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<AuthorityKeyType>,
    principals: Principals
  ): Promise<Certificate>
};
