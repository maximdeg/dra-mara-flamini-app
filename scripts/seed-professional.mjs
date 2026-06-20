// Seed (or update) the single Professional — the only authenticated identity.
//
// Standalone Node script (no TS build needed): it talks to Mongo and bcryptjs
// directly, writing the same `professional` document shape the Mongo adapter
// reads. Run after setting MONGODB_URI and the SEED_PROFESSIONAL_* vars:
//
//   node --env-file=.env scripts/seed-professional.mjs
//
// Idempotent: upserts on email, so re-running updates the password/profile.

import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "maraflamini";
const email = (process.env.SEED_PROFESSIONAL_EMAIL ?? "").trim().toLowerCase();
const password = process.env.SEED_PROFESSIONAL_PASSWORD ?? "";

if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "SEED_PROFESSIONAL_EMAIL and SEED_PROFESSIONAL_PASSWORD must both be set.",
  );
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const collection = client.db(dbName).collection("professional");
  const passwordHash = await hash(password, 10);

  const result = await collection.updateOne(
    { email },
    {
      $set: { email, passwordHash, emailVerified: null },
      $setOnInsert: {
        id: randomUUID(),
        name: "",
        phone: "",
        whatsappNumber: "",
      },
    },
    { upsert: true },
  );

  console.log(
    result.upsertedCount > 0
      ? `Created Professional ${email}.`
      : `Updated Professional ${email}.`,
  );
} finally {
  await client.close();
}
