const payload = {
  event: "payment.completed",
  paymentId: "manual_trigger_1",
  reference: "manual_1",
  status: "COMPLETED",
  amount: 79,
  phoneNumber: "237000000",
  externalId: "GTB_1786286937779_bb1efa49-65b1-48a5-a088-9127a6a8c29b_430e2895-6493-424e-9be6-b870b3811a79_monthly",
  metadata: {},
  completedAt: new Date().toISOString(),
  failedAt: null,
  failureReason: null,
  timestamp: new Date().toISOString()
};

async function run() {
  console.log("Sending manual webhook...");
  const res = await fetch("https://goldtradingbot.onrender.com/payments/kpay-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-kpay-signature": "dummy_signature",
      "x-kpay-event": "payment.completed"
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Response status:", res.status);
  console.log("Response body:", text);
}

run().catch(console.error);
