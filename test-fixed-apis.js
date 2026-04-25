const API_BASE = 'http://localhost:3000';

async function testFixedAPIs() {
  console.log('\n🧪 TESTING FIXED APIs\n');

  try {
    // Test 1: Match API with GET
    console.log('1️⃣ Testing Match API (GET)...');
    const matchRes = await fetch(`${API_BASE}/api/match`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${matchRes.status}`);
    if (matchRes.status === 200) {
      console.log(`   ✅ GET method works!\n`);
    }

    // Test 2: Match API with POST
    console.log('2️⃣ Testing Match API (POST)...');
    const matchPostRes = await fetch(`${API_BASE}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log(`   Status: ${matchPostRes.status}`);
    if (matchPostRes.status === 200 || matchPostRes.status === 401) {
      console.log(`   ✅ POST method now supported!\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('✅ API tests complete!\n');
}

testFixedAPIs();
