// Usage: bun run hash-password
// Prints the values to set as Fly secrets for the admin login.
import { randomBytes } from "node:crypto";

const password = prompt("Admin password:");
if (!password || password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
// base64 so `$` characters survive .env files (the server decodes it).
const hash = Buffer.from(await Bun.password.hash(password, { algorithm: "argon2id" })).toString("base64");
const secret = randomBytes(32).toString("hex");

console.log("\nADMIN_PASSWORD_HASH=" + hash);
console.log("SESSION_SECRET=" + secret);
console.log("\nTo set on Fly:");
console.log(`  fly secrets set ADMIN_PASSWORD_HASH=${hash} SESSION_SECRET=${secret}`);
