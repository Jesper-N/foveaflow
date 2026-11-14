import { createHash } from "node:crypto";

export const inlineScriptHash = (script: string) =>
  `sha256-${createHash("sha256").update(script).digest("base64")}` as const;
