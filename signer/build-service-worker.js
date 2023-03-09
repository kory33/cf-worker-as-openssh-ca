#!/usr/bin/env node

const fs = require("fs");
const esbuild = require("esbuild");

esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/cloudflare/index.service.ts"],
    bundle: true,
    minify: true,
    outfile: "dest/index.min.js",
  })
  .catch(() => process.exit(1));

fs.copyFile(
  "internal-crypto-wasm/pkg/signer_internal_crypto_bg.wasm",
  "dest/signer_internal_crypto_bg.wasm",
  () => {}
)
