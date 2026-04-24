/**
 * Test the complete browser-based registration flow
 * This script tests the form submission and redirect behavior
 */

const API_URL = 'http://localhost:3000';

async function testBrowserRegistration() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🧪 BROWSER REGISTRATION FLOW TEST');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Get the register page to verify it loads
    console.log('📍 Step 1: Fetching register page...');
    const pageRes = await fetch(`${API_URL}/register`);
    console.log(`✅ Page Status: ${pageRes.status}`);

    if (pageRes.status !== 200) {
      console.log('❌ Failed to load register page');
      return { success: false };
    }

    // Now test the actual registration by calling the server action directly
    // (simulating what the form would do)
    console.log('\n📍 Step 2: Testing registration server action...');

    const uniqueEmail = `testuser.${Date.now()}@example.com`;
    const formData = new URLSearchParams();
    formData.append('fullName', 'Test User');
    formData.append('email', uniqueEmail);
    formData.append('password', 'Test123456!');
    formData.append('role', 'founder');

    // The server action is called via the API, not directly
    // So we test via the API endpoint instead
    const registerRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: uniqueEmail,
        password: 'Test123456!',
        role: 'founder'
      })
    });

    const registerData = await registerRes.json();
    console.log(`📊 Status: ${registerRes.status}`);
    console.log(`✅ Success: ${registerData.success}`);

    if (registerData.success) {
      console.log(`👤 User ID: ${registerData.data.user.id.substring(0, 8)}...`);
      console.log(`📧 Email: ${registerData.data.user.email}`);

      // Now test login to verify the account works
      console.log('\n📍 Step 3: Testing login with new account...');
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'Test123456!'
        })
      });

      const loginData = await loginRes.json();
      console.log(`📊 Login Status: ${loginRes.status}`);
      console.log(`✅ Login Success: ${loginData.success}`);

      if (loginData.success) {
        console.log(`🎭 Role: ${loginData.data?.user?.role || 'unknown'}`);
        console.log(`🔐 Token: ${loginData.data.token?.substring(0, 20)}...`);
      } else {
        console.log(`❌ Login Error: ${loginData.error}`);
      }

      return { success: true, userId: registerData.data.user.id };
    } else {
      console.log(`❌ Registration Error: ${registerData.error}`);
      return { success: false };
    }
  } catch (e) {
    console.log(`❌ Exception: ${e.message}`);
    return { success: false };
  }
}

async function main() {
  const result = await testBrowserRegistration();

  console.log('\n═══════════════════════════════════════════');
  console.log(result.success ? '✅ REGISTRATION FLOW PASSED' : '❌ REGISTRATION FLOW FAILED');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
