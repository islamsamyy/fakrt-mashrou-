const API_URL = 'http://localhost:3000/api';

async function testFounderRegistration() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 1: FOUNDER REGISTRATION');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'محمد الساير',
        email: 'founder@ideabusiness.com',
        password: 'Test123456!',
        role: 'founder'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.data) {
      console.log(`👤 User ID: ${data.data.user?.id?.substring(0, 8)}...`);
      console.log(`📧 Email: ${data.data.user?.email}`);
    }
    if (data.message) {
      console.log(`📝 Message: ${data.message}`);
    }
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    return { success: data.success, email: data.data?.user?.email };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function testInvestorRegistration() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 2: INVESTOR REGISTRATION');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'فاطمة الخالدي',
        email: 'investor@ideabusiness.com',
        password: 'Test123456!',
        role: 'investor'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.data) {
      console.log(`👤 User ID: ${data.data.user?.id?.substring(0, 8)}...`);
      console.log(`📧 Email: ${data.data.user?.email}`);
    }
    if (data.message) {
      console.log(`📝 Message: ${data.message}`);
    }
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    return { success: data.success, email: data.data?.user?.email };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function testFounderLogin() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 3: FOUNDER LOGIN');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'founder@ideabusiness.com',
        password: 'Test123456!'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.data) {
      console.log(`👤 User: ${data.data.user?.full_name}`);
      console.log(`📧 Email: ${data.data.user?.email}`);
      console.log(`🎭 Role: founder`);
      console.log(`🔐 Token: ${data.data.token?.substring(0, 20)}...`);
    }
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    return { success: data.success };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function testInvestorLogin() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 4: INVESTOR LOGIN');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'investor@ideabusiness.com',
        password: 'Test123456!'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.data) {
      console.log(`👤 User: ${data.data.user?.full_name}`);
      console.log(`📧 Email: ${data.data.user?.email}`);
      console.log(`🎭 Role: investor`);
      console.log(`🔐 Token: ${data.data.token?.substring(0, 20)}...`);
    }
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    return { success: data.success };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function testWrongPasswordLogin() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 5: LOGIN WITH WRONG PASSWORD');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'founder@ideabusiness.com',
        password: 'WrongPassword123!'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.error) {
      console.log(`❌ Error (Expected): ${data.error}`);
    }
    return { success: !data.success, error: data.error };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function testDuplicateEmailRegistration() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 TEST 6: DUPLICATE EMAIL REGISTRATION');
  console.log('═══════════════════════════════════════════\n');

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'محمد آخر',
        email: 'founder@ideabusiness.com',
        password: 'Test123456!',
        role: 'investor'
      })
    });

    const data = await res.json();
    console.log(`📊 Status: ${res.status}`);
    console.log(`✅ Success: ${data.success}`);
    if (data.error) {
      console.log(`❌ Error (Expected): ${data.error}`);
    }
    return { success: !data.success, error: data.error };
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🧪 COMPLETE FLOW TEST                                   ║');
  console.log('║                    Registration & Login Testing                            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const results = [];

  results.push(await testFounderRegistration());
  results.push(await testInvestorRegistration());
  results.push(await testFounderLogin());
  results.push(await testInvestorLogin());
  results.push(await testWrongPasswordLogin());
  results.push(await testDuplicateEmailRegistration());

  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         📊 TEST SUMMARY                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📊 Success Rate: ${Math.round((passed/total)*100)}%\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Complete flow is working correctly.\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Check the errors above.\n`);
  }
}

main().catch(console.error);
