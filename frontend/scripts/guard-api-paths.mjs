import { readFileSync } from "fs";
import { globby } from "globby";

const files = await globby(["src/**/*.{ts,tsx,js,jsx}"]);
const offenders = [];

for (const f of files) {
  const text = readFileSync(f, "utf8");
  const badDirect = /['"`]\/api\//.test(text);
  const badBase = /baseURL\s*:\s*['"`]\/api\b/.test(text);
  const badImportMix =
    (f.includes("/app/") || f.includes("/components/")) && /from\s+['"`].*\/lib\/http\/server['"`]/.test(text);

  if (badDirect || badBase || badImportMix) offenders.push(f);
}

if (offenders.length) {
  console.error("❌ Blocked: direct /api/ usage or wrong HTTP client import:");
  offenders.forEach((f) => console.error(" -", f));
  process.exit(1);
} else {
  console.log("✅ Guards passed.");
}


