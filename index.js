const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Meta Webhook Verify Token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "aetheria_webhook_2026";

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Aetheria 2K26 Bot is LIVE 🔥");
});

// Meta Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

// Receive WhatsApp messages
app.post("/webhook", (req, res) => {
  console.log("📩 WhatsApp Webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  // Tell Meta we received the webhook
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🔥 Aetheria Bot running on port ${PORT}`);
});
