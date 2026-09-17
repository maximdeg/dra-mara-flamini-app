// Throwaway smoke test for the Meta WhatsApp Cloud API sender.
//
// Confirms phone-number-id + access token + registered recipient + template
// work BEFORE the env values go to Vercel. It issues the same Graph API call
// as the production transport (lib/notifications/meta-whatsapp-client.ts) but
// standalone, so it needs no build step — like smoke-test-twilio.mjs.
//
//   npm run smoke:meta -- --hello   Send the pre-approved hello_world template.
//                                   Run this FIRST: it proves the token, the
//                                   phone-number-id and the registered
//                                   recipient before your own template exists.
//   npm run smoke:meta              Send the Confirmation template with sample
//                                   date/time — proves the approved template
//                                   name + language too.
//
// Prerequisites:
//   1. Fill the META_WHATSAPP_* vars in .env (gitignored).
//   2. While on the Meta test number, register TEST_WHATSAPP_NUMBER as a
//      recipient (app dashboard → WhatsApp → API Setup → "To" → Manage).
//
// Safe to delete once Meta is verified live (#64 removes it alongside Twilio's).

const {
  META_WHATSAPP_PHONE_NUMBER_ID,
  META_WHATSAPP_ACCESS_TOKEN,
  META_WHATSAPP_CONFIRMATION_TEMPLATE_NAME,
  META_WHATSAPP_TEMPLATE_LANGUAGE,
} = process.env;

// The recipient to smoke-test against. WHATSAPP_TEST_RECIPIENT is the clinic's
// own test handset; TEST_WHATSAPP_NUMBER is the older name kept as a fallback.
const TEST_WHATSAPP_NUMBER =
  process.env.WHATSAPP_TEST_RECIPIENT ?? process.env.TEST_WHATSAPP_NUMBER;

const helloMode = process.argv.includes("--hello");

// The Confirmation template vars are only required when actually sending it.
const required = {
  META_WHATSAPP_PHONE_NUMBER_ID,
  META_WHATSAPP_ACCESS_TOKEN,
  TEST_WHATSAPP_NUMBER,
  ...(helloMode
    ? {}
    : { META_WHATSAPP_CONFIRMATION_TEMPLATE_NAME, META_WHATSAPP_TEMPLATE_LANGUAGE }),
};

const unusable = Object.entries(required)
  .filter(([, value]) => !value || value.startsWith("REPLACE_WITH_"))
  .map(([key]) => key);

if (unusable.length > 0) {
  console.error(`Missing or placeholder env var(s): ${unusable.join(", ")}`);
  console.error("Fill them in .env, then re-run `npm run smoke:meta`.");
  process.exit(1);
}

// The approved appointment_confirmation_1 [es_AR] body has SIX placeholders:
// {{1}} nombre, {{2}} fecha, {{3}} hora, {{4}} tipo, {{5}} obra social,
// {{6}} enlace. Sending the wrong count is rejected with error 100. The
// production sender (lib/notifications/whatsapp/confirmation.ts) fills the same
// six; these are sample values proving the template end-to-end.
const template = helloMode
  ? { name: "hello_world", language: { code: "en_US" } }
  : {
      name: META_WHATSAPP_CONFIRMATION_TEMPLATE_NAME,
      language: { code: META_WHATSAPP_TEMPLATE_LANGUAGE },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: "Maxim" },
            { type: "text", text: "22/06/2026" },
            { type: "text", text: "09:30" },
            { type: "text", text: "Consulta · Primera vez" },
            { type: "text", text: "OSDE" },
            { type: "text", text: "https://www.dramaraflaminiprida.com/cita/demo" },
          ],
        },
      ],
    };

console.log(
  `Sending "${template.name}" (${template.language.code}) to ${TEST_WHATSAPP_NUMBER} ...`,
);

const response = await fetch(
  `https://graph.facebook.com/v23.0/${META_WHATSAPP_PHONE_NUMBER_ID}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${META_WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: TEST_WHATSAPP_NUMBER,
      type: "template",
      template,
    }),
  },
);

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  const error = body.error ?? {};
  console.error(`FAILED — Cloud API returned ${response.status}:`);
  console.error(`  [${error.code ?? "?"}] ${error.message ?? "(no error message)"}`);
  if (error.error_data?.details) console.error(`  ${error.error_data.details}`);
  const hints = {
    190: "Token invalid or expired — temporary tokens die after 24h; generate a" +
      " fresh one (or a permanent System User token).",
    131030: "Recipient not registered — while on the test number, add" +
      " TEST_WHATSAPP_NUMBER under WhatsApp → API Setup → \"To\" and verify the code.",
    132001: "Template not found for that name + language — check" +
      " META_WHATSAPP_CONFIRMATION_TEMPLATE_NAME / _LANGUAGE and that it is APPROVED." +
      " Try `npm run smoke:meta -- --hello` to isolate token problems from template problems.",
  };
  if (hints[error.code]) console.error(`  Hint: ${hints[error.code]}`);
  process.exit(1);
}

console.log("OK — Cloud API accepted the message");
console.log(`  wamid: ${body.messages?.[0]?.id}`);
console.log("\nThe WhatsApp should arrive on the registered phone shortly.");
