/**
 * The WhatsApp socket seam — the slice of a Baileys connection the sender needs:
 * resolve whether a JID is on WhatsApp, and send a text. Two adapters satisfy it
 * — the real Baileys socket (slice 05) and the FakeWhatsAppSocket below, used in
 * tests and in dev until the real worker is paired.
 */
export interface WhatsAppSocket {
  /**
   * Resolve a JID's WhatsApp registration, returning the canonical JID to send
   * to, or null if the number is not on WhatsApp. (Baileys' `onWhatsApp` can
   * return a JID that differs from the dialed one — e.g. Argentina's `9`.)
   */
  resolveJid(jid: string): Promise<string | null>;
  /** Send a text message to a JID; returns the WhatsApp message id. */
  sendText(jid: string, text: string): Promise<{ id: string }>;
}

/**
 * Fake socket — every number resolves (unless constructed `registered: false`)
 * and sends return a synthetic id. Stands in for Baileys until slice 05.
 */
export class FakeWhatsAppSocket implements WhatsAppSocket {
  constructor(private readonly options: { registered?: boolean } = {}) {}

  async resolveJid(jid: string): Promise<string | null> {
    return (this.options.registered ?? true) ? jid : null;
  }

  async sendText(jid: string): Promise<{ id: string }> {
    return { id: `fake-wa-${jid}` };
  }
}
