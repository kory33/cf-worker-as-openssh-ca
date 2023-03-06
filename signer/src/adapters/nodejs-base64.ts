export function base64StringFromUint8Array(array: Uint8Array): string {
  return Buffer.from(array).toString("base64");
}

export function uint8ArrayFromBase64String(string: string): Uint8Array {
  return Buffer.from(string, "base64");
}
