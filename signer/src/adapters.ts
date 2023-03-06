import { crypto, CryptoKeyPair, Fetcher, KVNamespace, Request } from "@cloudflare/workers-types";
import { Env } from ".";
import { ECDSA_P521 } from "./key-types";
import { AuthoritySSHKeyPairStore, KeyPairGenerator, PrincipalsAuthenticator, Signer, Principals, KeyPair, Certificate, PublicKey, SSHKeyPairFormatter, PrivateKey } from "./models";
import { base64StringFromUint8Array, uint8ArrayFromBase64String } from "./nodejs-base64";

const signerFrom = (env: Env): Signer<ECDSA_P521> => ({
  signShortLived: async <UserKeyType>(
    targetKey: PublicKey<UserKeyType>,
    authorityKeyPair: KeyPair<ECDSA_P521>,
    principals: Principals
  ): Promise<Certificate> => {
    throw "TODO: Not implemented!";
  }
});

const generatorFrom = (env: Env): KeyPairGenerator<ECDSA_P521> => ({
  secureGenerate: async (): Promise<KeyPair<ECDSA_P521>> => {
    throw "TODO: Not implemented!";
  }
});

const sshKeyPairFormatterFrom = (env: Env): SSHKeyPairFormatter<ECDSA_P521, ECDSA_P521> => ({
  inOpenSSHPublicKeyFormat: async (publicKey: PublicKey<ECDSA_P521>): Promise<string> => {
    throw "TODO: Not implemented!";
  },
  inOpenSSHPrivateKeyFileFormat: async (privateKey: PrivateKey<ECDSA_P521>): Promise<string> => {
    throw "TODO: Not implemented!";
  },
});

function keyPairStoreFrom(signingKeyPairNamespace: KVNamespace): AuthoritySSHKeyPairStore<ECDSA_P521> {
  const KEYPAIR_JSON_KEY = "SIGNING_KEY_PAIR_JSON"

  type PersistedJsonObject = {
    readonly rawPublicKey: string;
    readonly rawPrivateKey: string;
  }

  function isPersistedJsonObjectAsExpected(value: unknown): value is PersistedJsonObject {
    return (
      typeof value === 'object' && value !== null &&
      "rawPublicKey" in value && typeof value.rawPublicKey === "string" &&
      "rawPrivateKey" in value && typeof value.rawPrivateKey === "string"
    );
  }

  return ({
    getStoredKeyPair: async (): Promise<KeyPair<ECDSA_P521> | null> => {
      const json = await signingKeyPairNamespace.get(KEYPAIR_JSON_KEY, "json");
      if (!(isPersistedJsonObjectAsExpected(json))) {
        throw `Value found at ${KEYPAIR_JSON_KEY} does not conform to predefined schema`;
      }
      return ({
        publicKey: {
          type: "ECDSA-P521",
          raw: () => uint8ArrayFromBase64String(json.rawPublicKey),
        },
        privateKey: {
          type: "ECDSA-P521",
          raw: () => uint8ArrayFromBase64String(json.rawPrivateKey),
        },
      });
    },
    store: async (authoritySSHKeyPair: KeyPair<ECDSA_P521>): Promise<void> => {
      await signingKeyPairNamespace.put(
        KEYPAIR_JSON_KEY,
        JSON.stringify({
          rawPublicKey: base64StringFromUint8Array(authoritySSHKeyPair.publicKey.raw()),
          rawPrivateKey: base64StringFromUint8Array(authoritySSHKeyPair.privateKey.raw()),
        } satisfies PersistedJsonObject)
      )
    },
  })
}

function principalsAuthenticatorFrom(authenticatorService: Fetcher): PrincipalsAuthenticator<Request> {
  return ({
    validPrincipalsFor: async (clonedRequest: Request): Promise<Principals> => {
      const response = await authenticatorService.fetch(clonedRequest)
      
      if (!response.ok) {
        throw `Unexpected response status ${response.status} from authenticator.`
      }

      const json = await response.json<unknown>();
      if (!Array.isArray(json)) {
        throw "Received non-array value from authenticator.";
      }

      return json.map((x: unknown) => {
        if (typeof x === "string") return x;
        else throw "Received non-string value inside top-level array from authenticator.";
      });
    }
  })
}

export type AdaptedEntities = {
  readonly signer: Signer<ECDSA_P521>;
  readonly keyPairGenerator: KeyPairGenerator<ECDSA_P521>;
  readonly keyPairStore: AuthoritySSHKeyPairStore<ECDSA_P521>;
  readonly authenticator: PrincipalsAuthenticator<Request>;
  readonly formatter: SSHKeyPairFormatter<ECDSA_P521, ECDSA_P521>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: signerFrom(env),
    keyPairGenerator: generatorFrom(env),
    keyPairStore: keyPairStoreFrom(env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
    formatter: sshKeyPairFormatterFrom(env),
  });
}
