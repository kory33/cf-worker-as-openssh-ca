#!/usr/bin/env node
const esbuild = require("esbuild");

esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/index.service.ts"],
    bundle: true,
    minify: false,
    outfile: "dest/service-worker/index.service.js",
  })
  .catch(() => process.exit(1));
