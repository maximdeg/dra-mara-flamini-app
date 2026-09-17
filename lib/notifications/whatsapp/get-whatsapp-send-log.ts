import { getDb } from "../../db/mongo";
import { MongoWhatsAppSendLog } from "./mongo-whatsapp-send-log";
import type { WhatsAppSendLog } from "./send-log";

/**
 * Production wiring at the Send Log seam. Tests construct an
 * InMemoryWhatsAppSendLog directly.
 */
export async function getWhatsAppSendLog(): Promise<WhatsAppSendLog> {
  return new MongoWhatsAppSendLog(await getDb());
}
