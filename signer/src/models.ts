import { LiteralStringOrNever } from "./typehacks";

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

export type KeyPairGenerator<KeyType extends KeyTypes> = {
  secureGenerate(): Promise<KeyPair<KeyType>>;
};

export type SSHKeyPairFormatter<AuthorityKeyType extends KeyTypes, ClientKeyType extends KeyTypes> = {
  inOpenSSHPublicKeyFormat(publicKey: PublicKey<AuthorityKeyType>): Promise<string>;
  inOpenSSHPrivateKeyFileFormat(keyPair: KeyPair<ClientKeyType>): Promise<string>;
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
  readonly openSSHCertificateString: string;
};

export type Signer<AuthorityKeyType extends KeyTypes> = {
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
  signCertificate<UserKeyType extends KeyTypes>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<AuthorityKeyType>,
    principals: Principals,
    valid_after: bigint,
    valid_before: bigint
  ): Promise<Certificate>
};
