import { AppEntities, KeyTypes, UnixTime } from "../core/models";
import * as services from "../core/services";

export async function getCaPublicKey<Req, ClientKeyType extends KeyTypes, AuthorityKeyType extends KeyTypes>(
	entities: AppEntities<Req, ClientKeyType, AuthorityKeyType>,
): Promise<Response> {
	const publicKey = await services.ensureKeyPairIsInRepositoryAndGetPublicKey(
    entities.authorityKeyPairGenerator, entities.authorityKeyPairStore
  )
  const publicKeyInSSHFormat = await entities.authorityKeyFormatter.formatPublicKeyToOpenSSH(publicKey);

  return new Response(publicKeyInSSHFormat, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"      
    }
  })
}

export async function postNewShortLivedCertificate<Req, ClientKeyType extends KeyTypes, AuthorityKeyType extends KeyTypes>(
	clonedRequest: Req,
  validitySeconds: UnixTime,
	entities: AppEntities<Req, ClientKeyType, AuthorityKeyType>,
): Promise<Response> {
  const generationResult = await services.generateSignedKeyPairUsingStoredCAKeyPair(
    clonedRequest,
    validitySeconds,
    entities.authorityKeyPairStore,
    entities.authenticator,
    entities.clientKeyPairGenerator,
    entities.signer
  );

  if (generationResult.__tag === "Success") {
    return Response.json({
      privateKey: await entities.clientKeyFormatter.formatPrivateKeyToOpenSSH(generationResult.keyPair),
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
