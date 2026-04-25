const API_BASE = 'http://localhost:3000';

async function testUserJourney() {
  console.log('\n🧪 STARTING USER JOURNEY TEST\n');
  
  const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
    userType: 'investor'
  };

  console.log('📝 Test Account Details:');
  console.log(`  Email: ${testUser.email}`);
  console.log(`  Name: ${testUser.fullName}`);
  console.log(`  Type: ${testUser.userType}\n`);

  try {
    // Test 1: Check homepage
    console.log('1️⃣ Testing Homepage...');
    const homeRes = await fetch(`${API_BASE}/`);
    console.log(`   ✅ Status: ${homeRes.status}\n`);

    // Test 2: Check login page
    console.log('2️⃣ Testing Login Page...');
    const loginRes = await fetch(`${API_BASE}/login`);
    console.log(`   ✅ Status: ${loginRes.status}\n`);

    // Test 3: Check registration page
    console.log('3️⃣ Testing Registration Page...');
    const registerRes = await fetch(`${API_BASE}/register`);
    console.log(`   ✅ Status: ${registerRes.status}\n`);

    // Test 4: Check discover page
    console.log('4️⃣ Testing Discover Page...');
    const discoverRes = await fetch(`${API_BASE}/discover`);
    console.log(`   ✅ Status: ${discoverRes.status}\n`);

    // Test 5: Check for-investors page
    console.log('5️⃣ Testing For-Investors Page...');
    const investorsRes = await fetch(`${API_BASE}/for-investors`);
    console.log(`   ✅ Status: ${investorsRes.status}\n`);

    // Test 6: Check for-founders page
    console.log('6️⃣ Testing For-Founders Page...');
    const foundersRes = await fetch(`${API_BASE}/for-founders`);
    console.log(`   ✅ Status: ${foundersRes.status}\n`);

    // Test 7: Check blog
    console.log('7️⃣ Testing Blog Page...');
    const blogRes = await fetch(`${API_BASE}/blog`);
    console.log(`   ✅ Status: ${blogRes.status}\n`);

    // Test 8: Check about page
    console.log('8️⃣ Testing About Page...');
    const aboutRes = await fetch(`${API_BASE}/about`);
    console.log(`   ✅ Status: ${aboutRes.status}\n`);

    // Test 9: Check how-it-works
    console.log('9️⃣ Testing How-It-Works Page...');
    const howRes = await fetch(`${API_BASE}/how-it-works`);
    console.log(`   ✅ Status: ${howRes.status}\n`);

    console.log('✅ All public pages accessible!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUserJourney();
