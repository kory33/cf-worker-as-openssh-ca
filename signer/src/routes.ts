import { Request, ExecutionContext, Response } from "@cloudflare/workers-types";
import { AdaptedEntities } from "./adapters";
import * as services from "./services";

export async function getCaPublicKey(
	request: Request,
	adapted: AdaptedEntities,
	ctx: ExecutionContext
): Promise<Response> {
	const publicKey = await services.ensureKeyPairIsInRepositoryAndGetPublicKey(
    adapted.keyPairGenerator, adapted.keyPairStore
  )
  const publicKeyInSSHFormat = await adapted.formatter.inOpenSSHPublicKeyFormat(publicKey);

  return new Response(publicKeyInSSHFormat, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"      
    }
  })
}

export async function postNewShortLivedCertificate(
	request: Request,
	adapted: AdaptedEntities,
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
    const inOpenSSHPrivateKeyFileFormat = await adapted.formatter.inOpenSSHPrivateKeyFileFormat(generationResult.privateKey);
    return Response.json({
      privateKey: inOpenSSHPrivateKeyFileFormat,
      certificate: generationResult.signedShortLivedCertificate.asBase64String(),
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
    return generationResult; // case exhausted
  }
}
