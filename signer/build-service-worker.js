#!/usr/bin/env node

const fs = require("fs");
const esbuild = require("esbuild");

esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/cloudflare/index.service.ts"],
    bundle: true,
    minify: false,
    outfile: "dest/service-worker/index.service.js",
  })
  .then(() => {
    fs.copyFile(
      "internal-crypto-wasm/pkg/signer_internal_crypto_bg.wasm",
      "dest/service-worker/signer_internal_crypto_bg.wasm",
      () => {}
    )
  })
  .catch(() => process.exit(1));
