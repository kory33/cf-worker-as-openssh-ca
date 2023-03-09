import { LiteralStringOrNever } from "./typehacks";

export type UnixTime = bigint;

// We currently only handle Ed25519 keys
export type KeyTypes = "Ed25519";

export type PublicKey<KeyType extends KeyTypes> = {
  readonly type: KeyType;
  readonly raw: Uint8Array;
};

export type PrivateKey<KeyType extends KeyTypes> = {
  readonly type: KeyType;
  readonly raw: Uint8Array;
};

export type KeyPair<KeyType extends KeyTypes> = {
  readonly publicKey: PublicKey<LiteralStringOrNever<KeyType>>;
  readonly privateKey: PrivateKey<LiteralStringOrNever<KeyType>>;
};

export type Principals = string[];

export type Certificate = {
  readonly openSSHCertificateString: string;
};

export type KeyPairGenerator<KeyType extends KeyTypes> = {
  secureGenerate(): Promise<KeyPair<KeyType>>;
};

export type OpenSSHPublicKeyFormatter<KeyType extends KeyTypes> = {
  formatPublicKeyToOpenSSH(publicKey: PublicKey<KeyType>): Promise<string>;
}

export type OpenSSHPrivateKeyFormatter<KeyType extends KeyTypes> = {
  formatPrivateKeyToOpenSSH(keyPair: KeyPair<KeyType>): Promise<string>;
}

export type AuthoritySSHKeyPairStore<KeyType extends KeyTypes> = {
  getStoredKeyPair(): Promise<KeyPair<KeyType> | null>;
  store(authoritySSHKeyPair: KeyPair<KeyType>): Promise<void>;
};

export type PrincipalsAuthenticator<Req> = {
  validPrincipalsFor(clonedRequest: Req): Promise<Principals>;
};

export type Signer<AuthorityKeyType extends KeyTypes, ClientKeyType extends KeyTypes> = {
  /**
   * Sign the {@link targetKey} using {@link authorityKeyPair},
   * allowing {@link principals} as principal names for the validity
   * within the range of {@link valid_after} and {@link valid_before}.
   * 
   * @param valid_after
   *  The (inclusive) start of certificate validity period, specified by Unix time.
   * @param valid_before 
   *  The (exclusive) end of certificate validity period, specified by Unix time.
   */
  signCertificate(
    targetKey: PublicKey<ClientKeyType>,
    authorityKeyPair: KeyPair<AuthorityKeyType>,
    principals: Principals,
    valid_after: UnixTime,
    valid_before: UnixTime
  ): Promise<Certificate>
};

export type AppEntities<Req, AuthorityKeyType extends KeyTypes, ClientKeyType extends KeyTypes> = {
  readonly signer: Signer<AuthorityKeyType, ClientKeyType>;
  readonly authorityKeyPairGenerator: KeyPairGenerator<AuthorityKeyType>;
  readonly clientKeyPairGenerator: KeyPairGenerator<ClientKeyType>;
  readonly authorityKeyFormatter: OpenSSHPublicKeyFormatter<AuthorityKeyType>;
  readonly clientKeyFormatter: OpenSSHPrivateKeyFormatter<ClientKeyType>;
  readonly authorityKeyPairStore: AuthoritySSHKeyPairStore<AuthorityKeyType>;
  readonly authenticator: PrincipalsAuthenticator<Req>;
};
