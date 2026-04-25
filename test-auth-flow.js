const API_BASE = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('\n🔐 TESTING AUTHENTICATION FLOW\n');

  const testUser = {
    email: 'testuser2026@example.com',
    password: 'TestPass123!@#',
    fullName: 'Test Investor',
    userType: 'investor'
  };

  try {
    // Test 1: Test registration endpoint
    console.log('1️⃣ Testing Registration Endpoint...');
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        full_name: testUser.fullName,
        user_type: testUser.userType
      })
    });

    const registerData = await registerRes.json();
    console.log(`   Status: ${registerRes.status}`);
    console.log(`   Response:`, registerData);
    console.log();

    // Test 2: Test login endpoint
    console.log('2️⃣ Testing Login Endpoint...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const loginData = await loginRes.json();
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   Response:`, loginData);
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuthFlow();
