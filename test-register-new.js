const API_BASE = 'http://localhost:3000';

async function testNewRegistration() {
  console.log('\n📝 TESTING NEW USER REGISTRATION\n');

  const newUser = {
    fullName: 'Test Investor User',
    email: `testinvestor${Date.now()}@example.com`,
    password: 'TestPass@123456',
    role: 'investor'
  };

  console.log(`📧 Registering new user:`);
  console.log(`   Name: ${newUser.fullName}`);
  console.log(`   Email: ${newUser.email}`);
  console.log(`   Type: ${newUser.role}\n`);

  try {
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    });

    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, registerData);

    if (registerRes.status === 200 || registerRes.status === 201) {
      console.log(`\n✅ Registration successful!`);
      
      // Try to login
      console.log(`\n🔑 Testing login with new account...\n`);
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password
        })
      });

      const loginData = await loginRes.json();
      console.log(`Login Status: ${loginRes.status}`);
      console.log(`Login Response:`, loginData);

      if (loginRes.status === 200) {
        console.log(`✅ Login successful!`);
      }
    } else {
      console.log(`❌ Registration failed`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNewRegistration();
