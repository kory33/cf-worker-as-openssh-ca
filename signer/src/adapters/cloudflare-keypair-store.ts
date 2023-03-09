import { KVNamespace } from "@cloudflare/workers-types";
import { AuthoritySSHKeyPairStore, KeyPair, KeyTypes } from "../models";
import { LiteralStringOrNever } from "../typehacks";

namespace StorageBridge {
  export const KEYPAIR_JSON_KEY = "SIGNING_KEY_PAIR_JSON"

  type PersistedJsonObject<KeyType extends KeyTypes> = {
    readonly keyType: LiteralStringOrNever<KeyType>;
    readonly rawPublicKey: string;
    readonly rawPrivateKey: string;
  }

  export function isPersistedJsonObjectAsExpected<KeyType extends KeyTypes>(
    value: unknown,
    expectedKeyType: LiteralStringOrNever<KeyType>
  ): value is PersistedJsonObject<KeyType> {
    return (
      typeof value === 'object' && value !== null &&
      "keyType" in value && typeof value.keyType === "string" && value.keyType === expectedKeyType &&
      "rawPublicKey" in value && typeof value.rawPublicKey === "string" &&
      "rawPrivateKey" in value && typeof value.rawPrivateKey === "string"
    );
  }

  export const fromPersisted = <KeyType extends KeyTypes>(json: PersistedJsonObject<KeyType>): KeyPair<KeyType> => {
    return ({
      publicKey: {
        type: json.keyType,
        raw: new Uint8Array(JSON.parse(json.rawPublicKey)),
      },
      privateKey: {
        type: json.keyType,
        raw: new Uint8Array(JSON.parse(json.rawPrivateKey)),
      },
    });
  }

  export const toPersisted = <KeyType extends KeyTypes>(authoritySSHKeyPair: KeyPair<KeyType>): PersistedJsonObject<KeyType> => ({
    keyType: authoritySSHKeyPair.publicKey.type,
    rawPublicKey: JSON.stringify(Array.from(authoritySSHKeyPair.publicKey.raw)),
    rawPrivateKey: JSON.stringify(Array.from(authoritySSHKeyPair.privateKey.raw)),
  })
}

export const keyPairStoreFrom =
  <KeyType extends KeyTypes>(
    keyType: LiteralStringOrNever<KeyType>,
    signingKeyPairNamespace: KVNamespace
  ): AuthoritySSHKeyPairStore<KeyType> => {

    return ({
      getStoredKeyPair: async (): Promise<KeyPair<KeyType> | null> => {
        const json = await signingKeyPairNamespace.get(StorageBridge.KEYPAIR_JSON_KEY, "json");
        if (json === null) return null;

        if (StorageBridge.isPersistedJsonObjectAsExpected(json, keyType)) {
          return StorageBridge.fromPersisted(json);
        } else {
          throw `Value found at ${StorageBridge.KEYPAIR_JSON_KEY} does not conform to predefined schema`;
        }
      },

      store: async (authoritySSHKeyPair: KeyPair<KeyType>): Promise<void> => {
        await signingKeyPairNamespace.put(
          StorageBridge.KEYPAIR_JSON_KEY,
          JSON.stringify(StorageBridge.toPersisted(authoritySSHKeyPair))
        )
      },
    })
  }
