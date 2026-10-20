import { writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const address = new URL(process.env.SHOP_API_URL || "");
if (
  address.protocol !== "https:" ||
  address.username ||
  address.password ||
  address.search ||
  address.hash ||
  address.pathname !== "/"
) {
  throw new Error(
    "SHOP_API_URL must be the HTTPS API origin without credentials or a path",
  );
}
const file = new URL(
  "../src/environments/environment.prod.ts",
  import.meta.url,
);
const original = readFileSync(file, "utf8");
try {
  writeFileSync(
    file,
    "export const environment = " +
      JSON.stringify({
        production: true,
        allowAdminRegistration: false,
        apiUrl: address.origin,
      }) +
      ";\n",
  );
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/@angular/cli/bin/ng.js",
      "build",
      "--configuration=production",
    ],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  writeFileSync(file, original);
}
