

async function testVercel() {
  console.log('--- TEST 1 : /api/license/verify ---');
  try {
    const res1 = await fetch('https://goldtradingbot-1mta.vercel.app/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: 99999999, broker: "test", server: "test", ea: "TEST" })
    });
    const data1 = await res1.text();
    console.log('Statut HTTP:', res1.status);
    console.log('Réponse:', data1);
  } catch(e) { console.error('Erreur:', e.message); }

  console.log('\n--- TEST 2 : /api/telemetry/snapshot ---');
  try {
    const res2 = await fetch('https://goldtradingbot-1mta.vercel.app/api/telemetry/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: 99999999, ea: "TEST", balance: 1000, equity: 1000 })
    });
    const data2 = await res2.text();
    console.log('Statut HTTP:', res2.status);
    console.log('Réponse:', data2);
  } catch(e) { console.error('Erreur:', e.message); }
}

testVercel();
