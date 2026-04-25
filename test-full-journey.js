const API_BASE = 'http://localhost:3000';

async function testCompleteUserJourney() {
  console.log('\n🚀 COMPLETE USER JOURNEY TEST\n');

  // Create test user
  const testUser = {
    fullName: `Test Journey ${Date.now()}`,
    email: `journey${Date.now()}@example.com`,
    password: 'JourneyTest@123456',
    role: 'investor'
  };

  try {
    // Step 1: Register
    console.log('📝 STEP 1: Registration');
    console.log(`   Email: ${testUser.email}`);
    
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerRes.json();
    if (registerRes.status === 201) {
      console.log(`   ✅ Registration successful`);
      console.log(`   User ID: ${registerData.data.user.id}\n`);
    } else {
      console.log(`   ❌ Registration failed: ${registerData.error}\n`);
      return;
    }

    // Step 2: Login
    console.log('🔑 STEP 2: Login');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    
    if (loginRes.status === 200 && token) {
      console.log(`   ✅ Login successful`);
      console.log(`   Token received\n`);
    } else {
      console.log(`   ❌ Login failed\n`);
      return;
    }

    // Step 3: Test protected pages
    console.log('🏠 STEP 3: Testing Protected Pages\n');

    const protectedPages = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Investor Dashboard', path: '/dashboard/investor' },
      { name: 'Messages', path: '/messages' },
      { name: 'Portfolio', path: '/portfolio' },
      { name: 'Opportunities', path: '/opportunities' },
      { name: 'Profile', path: `/profile/${registerData.data.user.id}` },
      { name: 'Settings', path: '/settings' },
      { name: 'Saved', path: '/saved' }
    ];

    for (const page of protectedPages) {
      try {
        const pageRes = await fetch(`${API_BASE}${page.path}`, {
          headers: {
            'Cookie': `auth_token=${token}`
          }
        });
        const status = pageRes.status;
        const symbol = status === 200 || status === 307 ? '✅' : '⚠️';
        console.log(`   ${symbol} ${page.name}: ${status}`);
      } catch (error) {
        console.log(`   ❌ ${page.name}: Error`);
      }
    }

    console.log('\n📊 STEP 4: Testing API Endpoints\n');

    const apiEndpoints = [
      { name: 'Match API', method: 'POST', path: '/api/match' },
      { name: 'Invest API', method: 'POST', path: '/api/invest' }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const apiRes = await fetch(`${API_BASE}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth_token=${token}`
          },
          body: JSON.stringify({})
        });
        console.log(`   ${endpoint.name}: ${apiRes.status}`);
      } catch (error) {
        console.log(`   ${endpoint.name}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✅ Journey test complete!\n');
}

testCompleteUserJourney();
