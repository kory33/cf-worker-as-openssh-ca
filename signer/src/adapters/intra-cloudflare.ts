import { Fetcher, KVNamespace, Request } from "@cloudflare/workers-types";
import { PrincipalsAuthenticator, Principals, AuthoritySSHKeyPairStore, KeyPair, KeyTypes } from "../models";
import { uint8ArrayFromBase64String, base64StringFromUint8Array } from "./nodejs-base64";

export function principalsAuthenticatorFrom(authenticatorService: Fetcher): PrincipalsAuthenticator<Request> {
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

export function keyPairStoreFrom<KeyType extends string>(
  keyType: KeyType, signingKeyPairNamespace: KVNamespace
): AuthoritySSHKeyPairStore<KeyType> {
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
    getStoredKeyPair: async (): Promise<KeyPair<KeyType> | null> => {
      const json = await signingKeyPairNamespace.get(KEYPAIR_JSON_KEY, "json");
      if (!(isPersistedJsonObjectAsExpected(json))) {
        throw `Value found at ${KEYPAIR_JSON_KEY} does not conform to predefined schema`;
      }
      return ({
        publicKey: {
          type: keyType,
          raw: () => uint8ArrayFromBase64String(json.rawPublicKey),
        },
        privateKey: {
          type: keyType,
          raw: () => uint8ArrayFromBase64String(json.rawPrivateKey),
        },
      });
    },
    store: async (authoritySSHKeyPair: KeyPair<KeyType>): Promise<void> => {
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
