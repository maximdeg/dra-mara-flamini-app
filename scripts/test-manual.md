
Getting the token

Step 1 — App + temporary token (gets you testing in ~10 minutes).
1. Go to https://developers.facebook.com and log in with the Facebook account that should own this (ideally the clinic's, since the WhatsApp Business account attaches to it) → My Apps → Create App → choose type Business.
2. In the new app's dashboard: Add product → WhatsApp → Set up. Meta gives the app a free test phone number.
3. Open WhatsApp → API Setup. Copy two things into your open .env:
  - Phone number ID (the opaque ID shown under the test "From" number — not the phone number itself, and not the WABA ID) → META_WHATSAPP_PHONE_NUMBER_ID
  - The temporary access token → META_WHATSAPP_ACCESS_TOKEN. It expires in 24 hours — fine for smoke testing, never for Vercel.
4. On that same API Setup page, in the "To" field, add +5491134286716 (your TEST_WHATSAPP_NUMBER). Meta sends a verification code to that phone via WhatsApp — enter it. The test number only delivers to up to 5 registered recipients; this is why the code keeps the recipient override.

Step 2 — The Confirmation template. In WhatsApp Manager → Message templates (https://business.facebook.com/wa/manage/message-templates) create a template: category Utility, name appointment_confirmation, language Spanish (ARG) (es_AR), body something like "Hola! Tu turno con la Dra. Mara Flamini quedó confirmado para el {{1}} a las {{2}}." — {{1}} gets the date (DD/MM/YYYY), {{2}} the time, matching what the sender fills in. Utility templates usually get approved within minutes to a few hours. If you pick a different name or language, update the two template vars in .env.

Step 3 — The permanent token (this is what goes to Vercel). Temporary tokens die after 24h, and because sends are best-effort-swallowed, an expired token means Confirmations silently stop — so don't deploy with one. Instead, in https://business.facebook.com → Settings → Users → System users:
1. Add a system user (e.g. maraxo-server, role Admin).
2. Assign assets: your app (full control), and the WhatsApp account.
3. Generate new token → select the app → token expiration Never → check whatsapp_business_messaging and whatsapp_business_management → Generate. Copy it immediately — it's shown only once. That's your META_WHATSAPP_ACCESS_TOKEN for both .env and Vercel.

Testing before pushing

I added the Meta twin of the existing Twilio smoke script — scripts/smoke-test-meta-whatsapp.mjs + npm run smoke:meta (uncommitted for now). It makes the same Graph API call as the production transport and prints hints for the three classic failures (expired token, unregistered recipient, unapproved template). Run in this order:

1. npm run smoke:meta -- --hello — sends Meta's pre-approved hello_world template. This isolates the credentials: it proves the token, phone-number-id, and registered recipient without needing your template approved yet. If this delivers, the token is good.
2. npm run smoke:meta — sends appointment_confirmation in es_AR with sample date/time. This additionally proves the template name, language, and approval. The WhatsApp should hit the test phone.
3. npm run dev, then book an appointment through the site — this exercises the real production path (booking → outbox → Meta sender) and is the "book → WhatsApp arrives" milestone from #63. You can also check the outbox entry got marked sent with a wamid.
4. Only then add the four META_WHATSAPP_* vars (with the permanent token) plus TEST_WHATSAPP_NUMBER to Vercel → Project → Settings → Environment Variables, and push.

One extra check if you ever doubt a token: curl "https://graph.facebook.com/debug_token?input_token=<TOKEN>&access_token=<TOKEN>" shows its expiry and scopes.
## Patient email notifications (off by default)

The Confirmation email and the Cancellation email to Patients are switched off at the client's request. The code is kept; to turn them back on, set `EMAIL_NOTIFICATIONS_ENABLED=true` (exactly `true`; anything else, or unset, means off) in `.env` and in Vercel, alongside `GOOGLE_EMAIL` / `GOOGLE_APP_PASSWORD`. While it's off, the Patient's appointment page hides the "Confirmación por email" row. The Professional's password-reset email is not affected and always sends.
