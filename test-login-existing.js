const API_BASE = 'http://localhost:3000';

async function testLoginWithExistingUser() {
  console.log('\n🔑 TESTING LOGIN WITH EXISTING SEED DATA\n');

  // From the seed data (10 investors, 10 founders created in April 2026)
  const testUsers = [
    {
      name: 'Investor 1',
      email: 'investor1@example.com',
      password: 'Test@1234'
    },
    {
      name: 'Founder 1', 
      email: 'founder1@example.com',
      password: 'Test@1234'
    }
  ];

  for (const user of testUsers) {
    console.log(`📧 Testing: ${user.email}`);
    try {
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      const loginData = await loginRes.json();
      console.log(`   Status: ${loginRes.status}`);
      if (loginRes.status === 200) {
        console.log(`   ✅ Login successful!`);
        console.log(`   User: ${user.name}`);
      } else {
        console.log(`   ❌ Error: ${loginData.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log();
  }
}

testLoginWithExistingUser();
