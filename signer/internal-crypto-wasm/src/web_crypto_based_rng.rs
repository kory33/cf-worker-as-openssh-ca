use ssh_key::rand_core::{impls, CryptoRng, RngCore};
use web_sys::Crypto;

pub struct WebCryptoBasedRng(pub Crypto);

impl RngCore for WebCryptoBasedRng {
    fn next_u32(&mut self) -> u32 {
        impls::next_u32_via_fill(self)
    }

    fn next_u64(&mut self) -> u64 {
        impls::next_u64_via_fill(self)
    }

    fn fill_bytes(&mut self, dest: &mut [u8]) {
        self.0.get_random_values_with_u8_array(dest).unwrap();
    }

    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), ssh_key::rand_core::Error> {
        Ok(self.fill_bytes(dest))
    }
}

impl CryptoRng for WebCryptoBasedRng {}
