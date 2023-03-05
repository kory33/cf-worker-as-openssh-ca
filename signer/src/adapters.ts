import { Fetcher, KVNamespace, Request } from "@cloudflare/workers-types";
import { Env } from ".";
import { AuthoritySSHKeyPairStore, SSHKeyPairGenerator, PrincipalsAuthenticator, Signer, Principals, SSHKeyPair } from "./models";

function signerFrom(env: Env): Signer {
  throw "TODO: not implemented."
}

function generatorFrom(env: Env): SSHKeyPairGenerator {
  throw "TODO: not implemented."
}

function keyPairStoreFrom(signingKeyPairNamespace: KVNamespace): AuthoritySSHKeyPairStore {
  const KEYPAIR_JSON_KEY = "SIGNING_KEY_PAIR_JSON"

  type PersistedJsonObject = {
    readonly sshPublicKeyString: string;
    readonly sshPemPrivateKeyString: string;
  }

  function isPersistedJsonObjectAsExpected(value: unknown): value is PersistedJsonObject {
    return (
      typeof value === 'object' && value !== null &&
      "sshPublicKeyString" in value && typeof value.sshPublicKeyString === "string" &&
      "sshPemPrivateKeyString" in value && typeof value.sshPemPrivateKeyString === "string"
    );
  }

  return ({
    getStoredKeyPair: async (): Promise<SSHKeyPair | null> => {
      const json = await signingKeyPairNamespace.get(KEYPAIR_JSON_KEY, "json");
      if (!(isPersistedJsonObjectAsExpected(json))) {
        throw `Value found at ${KEYPAIR_JSON_KEY} does not conform to predefined schema`;
      }
      return ({
        publicKey: { asSSHPublicKeyString: () => json.sshPublicKeyString },
        privateKey: { asPEMPrivateKeyString: () => json.sshPemPrivateKeyString },
      });
    },
    store: async (authoritySSHKeyPair: SSHKeyPair): Promise<void> => {
      await signingKeyPairNamespace.put(
        KEYPAIR_JSON_KEY,
        JSON.stringify({
          sshPublicKeyString: authoritySSHKeyPair.publicKey.asSSHPublicKeyString(),
          sshPemPrivateKeyString: authoritySSHKeyPair.privateKey.asPEMPrivateKeyString(),
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
  readonly signer: Signer;
  readonly keyPairGenerator: SSHKeyPairGenerator;
  readonly keyPairStore: AuthoritySSHKeyPairStore;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export function adapt(env: Env): AdaptedEntities {
  return ({
    signer: signerFrom(env),
    keyPairGenerator: generatorFrom(env),
    keyPairStore: keyPairStoreFrom(env.SIGNING_KEY_PAIR_NAMESPACE),
    authenticator: principalsAuthenticatorFrom(env.AUTHENTICATOR_SERVICE),
  });
}
