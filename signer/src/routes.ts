import { AuthoritySSHKeyPairStore, KeyPairGenerator, KeyTypes, OpenSSHPrivateKeyFormatter, OpenSSHPublicKeyFormatter, PrincipalsAuthenticator, Signer } from "./models";
import * as services from "./services";

export type AdaptedEntities<GlobalKeyType extends KeyTypes> = {
  readonly signer: Signer<GlobalKeyType>;
  readonly keyPairGenerator: KeyPairGenerator<GlobalKeyType>;
  readonly authorityKeyFormatter: OpenSSHPublicKeyFormatter<GlobalKeyType>;
  readonly clientKeyFormatter: OpenSSHPrivateKeyFormatter<GlobalKeyType>;
  readonly keyPairStore: AuthoritySSHKeyPairStore<GlobalKeyType>;
  readonly authenticator: PrincipalsAuthenticator<Request>;
};

export async function getCaPublicKey<GlobalKeyType extends KeyTypes>(
	request: Request,
	adapted: AdaptedEntities<GlobalKeyType>,
	ctx: ExecutionContext
): Promise<Response> {
	const publicKey = await services.ensureKeyPairIsInRepositoryAndGetPublicKey(
    adapted.keyPairGenerator, adapted.keyPairStore
  )
  const publicKeyInSSHFormat = await adapted.authorityKeyFormatter.formatPublicKeyToOpenSSH(publicKey);

  return new Response(publicKeyInSSHFormat, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"      
    }
  })
}

export async function postNewShortLivedCertificate<GlobalKeyType extends KeyTypes>(
	request: Request,
	adapted: AdaptedEntities<GlobalKeyType>,
	ctx: ExecutionContext
): Promise<Response> {
  const generationResult = await services.generateSignedKeyPairUsingStoredCAKeyPair(
    request.clone(),
    adapted.keyPairStore,
    adapted.authenticator,
    adapted.keyPairGenerator,
    adapted.signer
  );

  if (generationResult.__tag === "Success") {
    return Response.json({
      privateKey: await adapted.clientKeyFormatter.formatPrivateKeyToOpenSSH(generationResult.keyPair),
      certificate: generationResult.caSignedShortLivedCertificate.openSSHCertificateString,
    }, {
      status: 200
    });
  } else if (generationResult.__tag === "NoCAKeyPair") {
    return new Response("CA key pair is not yet generated. First GET /ca-public-key to generate a CA key pair.", {
      status: 400,
    })
  } else if (generationResult.__tag === "EmptyPrincipals") {
    return new Response("Empty principals.", {
      status: 401,
    })
  } else {
    return generationResult satisfies never; // case exhausted
  }
}
