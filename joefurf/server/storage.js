import { S3Client } from "bun";
import { mkdir, unlink } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { config } from "./config.js";

const s3 = config.s3 ? new S3Client(config.s3) : null;
const localRoot = join(config.dataDir, "uploads");

function localPath(key) {
  const path = normalize(join(localRoot, key));
  if (!path.startsWith(localRoot + "/")) throw new Error("invalid key");
  return path;
}

export async function putObject(key, data, type) {
  if (s3) {
    await s3.write(key, data, { type });
    return;
  }
  const path = localPath(key);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, data);
}

// Returns a Blob-like file, or null when missing.
export async function getObject(key) {
  const file = s3 ? s3.file(key) : Bun.file(localPath(key));
  return (await file.exists()) ? file : null;
}

export async function deleteObject(key) {
  try {
    if (s3) await s3.delete(key);
    else await unlink(localPath(key));
  } catch (err) {
    console.warn(`[storage] failed to delete ${key}:`, err.message);
  }
}
