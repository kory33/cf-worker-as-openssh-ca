use std::convert::{TryFrom, TryInto};

use ssh_key::{
    private::{Ed25519Keypair, Ed25519PrivateKey},
    public::Ed25519PublicKey,
};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct RawEd25519Keys {
    // must have length = 32 on input boundaries or panics
    public_key: Box<[u8]>,

    // must have length = 32 on input boundaries or panics
    unencrypted_private_key: Box<[u8]>,
}

#[wasm_bindgen]
impl RawEd25519Keys {
    #[wasm_bindgen(constructor)]
    pub fn new(public_key: Box<[u8]>, unencrypted_private_key: Box<[u8]>) -> Self {
        RawEd25519Keys {
            public_key,
            unencrypted_private_key,
        }
    }

    pub fn get_public(&self) -> Box<[u8]> {
        self.public_key.clone()
    }

    pub fn get_unencrypted_private(&self) -> Box<[u8]> {
        self.unencrypted_private_key.clone()
    }
}

impl TryInto<Ed25519Keypair> for &RawEd25519Keys {
    type Error = ssh_key::Error;

    fn try_into(self) -> Result<Ed25519Keypair, Self::Error> {
        Ok(Ed25519Keypair {
            public: Ed25519PublicKey::try_from(self.public_key.as_ref())?,
            private: Ed25519PrivateKey::try_from(self.unencrypted_private_key.as_ref())?,
        })
    }
}

impl From<Ed25519Keypair> for RawEd25519Keys {
    fn from(value: Ed25519Keypair) -> Self {
        RawEd25519Keys {
            public_key: Box::new(value.public.0),
            unencrypted_private_key: Box::new(value.private.to_bytes()),
        }
    }
}
