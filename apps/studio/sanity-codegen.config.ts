import { SanityCodegenConfig } from "sanity-codegen";

const config: SanityCodegenConfig = {
  schemaPath: "./schemas/schema.js",
  outputPath: "../web/src/schema.types.ts",
};

export default config;
