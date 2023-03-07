use std::convert::{TryFrom, TryInto};

use js_sys::JsString;
use ssh_key::{
    certificate::{self, CertType},
    private::{Ed25519Keypair, KeypairData},
    public::{Ed25519PublicKey, KeyData},
    PrivateKey, PublicKey,
};
use wasm_bindgen::prelude::*;

mod web_crypto_based_rng;
use web_crypto_based_rng::WebCryptoBasedRng;

mod exported_types;
use exported_types::RawEd25519Keys;

#[wasm_bindgen]
pub fn ed25519_key_pair_to_openssh_pem_private_key(raw_keys: &RawEd25519Keys) -> String {
    let key_pair: Ed25519Keypair = raw_keys.try_into().unwrap();

    PrivateKey::new(key_pair.into(), "")
        .unwrap()
        .to_openssh(ssh_key::LineEnding::LF)
        .unwrap()
        .to_string()
}

#[wasm_bindgen]
pub fn ed25519_generate() -> RawEd25519Keys {
    let window_crypto = web_sys::window().unwrap().crypto().unwrap();
    Ed25519Keypair::random(WebCryptoBasedRng(window_crypto)).into()
}

#[wasm_bindgen]
pub fn ed25519_public_key_to_openssh_public_key_format(raw_ed25519_key: &[u8]) -> String {
    let public_key_data: KeyData = Ed25519PublicKey::try_from(raw_ed25519_key).unwrap().into();

    // we will not include any comment in the generated OpenSSH public key
    let comment = "";

    PublicKey::new(public_key_data, comment)
        .to_openssh()
        .unwrap()
}

#[wasm_bindgen]
pub fn sign_ed25519_public_key_with_ed25519_key_pair(
    raw_public_key_to_be_signed: &[u8],
    signer_key: &RawEd25519Keys,
    principals: Vec<JsValue>, // must be nonempty string[] or panics
    valid_after: u64,
    valid_before: u64,
) -> String {
    let window_crypto = web_sys::window().unwrap().crypto().unwrap();

    let principals: Vec<String> = principals
        .iter()
        .map(|v| String::from(v.dyn_ref::<JsString>().unwrap()))
        .collect();

    if principals.is_empty() {
        panic!("Empty principal list is not allowed.")
    }

    let public_key_to_be_signed: KeyData = Ed25519PublicKey::try_from(raw_public_key_to_be_signed)
        .unwrap()
        .into();

    let key_pair: Ed25519Keypair = signer_key.try_into().unwrap();
    let private_key = PrivateKey::new(KeypairData::Ed25519(key_pair), "").unwrap();

    let mut builder = certificate::Builder::new_with_random_nonce(
        WebCryptoBasedRng(window_crypto),
        public_key_to_be_signed,
        valid_after,
        valid_before,
    );

    // add all principals
    builder.cert_type(CertType::User).unwrap();
    for principal in principals {
        builder.valid_principal(principal).unwrap();
    }

    builder.sign(&private_key).unwrap().to_openssh().unwrap()
}
