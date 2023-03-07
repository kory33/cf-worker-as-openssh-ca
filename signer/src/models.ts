import { LiteralStringOrNever } from "./typehacks";

// We currently only handle ecdsa-p521 keys
export type KeyTypes = "ECDSA-P521";

export type PublicKey<KeyType extends KeyTypes> = {
  readonly type: KeyType;
  readonly raw: Uint8Array;
};

export type PrivateKey<KeyType extends KeyTypes> = {
  readonly type: KeyType;
  readonly raw: Uint8Array;
};

export type KeyPair<KeyType extends KeyTypes> = {
  // constraint: publicKey.type === privateKey.type

  readonly publicKey: PublicKey<LiteralStringOrNever<KeyType>>;
  readonly privateKey: PrivateKey<LiteralStringOrNever<KeyType>>;
};

export type KeyPairGenerator<KeyType extends KeyTypes> = {
  secureGenerate(): Promise<KeyPair<KeyType>>;
};

export type SSHKeyPairFormatter<AuthorityKeyType extends KeyTypes, ClientKeyType extends KeyTypes> = {
  inOpenSSHPublicKeyFormat(publicKey: PublicKey<AuthorityKeyType>): Promise<string>;
  inOpenSSHPrivateKeyFileFormat(privateKey: PrivateKey<ClientKeyType>): Promise<string>;
}

export type AuthoritySSHKeyPairStore<KeyType extends KeyTypes> = {
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

export type Signer<AuthorityKeyType extends KeyTypes> = {
  signShortLived<UserKeyType extends KeyTypes>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<AuthorityKeyType>,
    principals: Principals
  ): Promise<Certificate>
};
