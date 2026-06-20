import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB connection helper for the production repository adapter.
 *
 * The client promise is cached on globalThis so Next.js hot-reload in dev does
 * not open a new connection on every change. The URI is read lazily at call
 * time, so importing this module never requires a database — builds and tests
 * stay decoupled from Mongo.
 */
declare global {
  // eslint-disable-next-line no-var
  var __maraMongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!globalThis.__maraMongoClientPromise) {
    globalThis.__maraMongoClientPromise = new MongoClient(uri).connect();
  }
  return globalThis.__maraMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(process.env.MONGODB_DB ?? "maraflamini");
}
