const API_URL = 'http://localhost:3000/api';

async function test(name, method, endpoint, body, expectedStatus) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    const pass = res.status === expectedStatus;
    console.log(`${pass ? '✓ PASS' : '✗ FAIL'} | ${name}`);
    console.log(`       Status: ${res.status} (expected ${expectedStatus})`);
    if (!pass) console.log(`       Error: ${data.error}`);
    return pass;
  } catch (e) {
    console.log(`✗ FAIL | ${name} - ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('     🧪 BACKEND FIX VERIFICATION REPORT                        ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const results = [];

  // LOGIN TESTS
  console.log('▶ USER LOGIN VALIDATION\n');
  results.push(await test('Empty credentials validation', 'POST', '/auth/login', { email: '', password: 'test' }, 400));
  results.push(await test('Wrong password handling', 'POST', '/auth/login', { email: 'test@test.com', password: 'wrong' }, 401));
  results.push(await test('Unregistered email handling', 'POST', '/auth/login', { email: 'nope@test.com', password: 'Test123456!' }, 401));

  // REGISTER TESTS
  console.log('\n▶ USER REGISTRATION VALIDATION\n');
  results.push(await test('Missing fields detection', 'POST', '/auth/register', { email: 'test@test.com' }, 400));
  results.push(await test('Invalid email format', 'POST', '/auth/register', { fullName: 'Test', email: 'bad', password: 'Test123456!', role: 'investor' }, 400));
  results.push(await test('Weak password detection', 'POST', '/auth/register', { fullName: 'Test', email: 'test@test.com', password: 'weak', role: 'investor' }, 400));
  results.push(await test('Duplicate email prevention', 'POST', '/auth/register', { fullName: 'Test', email: 'admin@test.com', password: 'Test123456!', role: 'investor' }, 409));

  // INVESTMENT TESTS
  console.log('\n▶ INVESTMENT PROCESS VALIDATION\n');
  results.push(await test('Unauthenticated request rejection', 'POST', '/invest', { projectId: 'p1', amount: 5000 }, 401));
  results.push(await test('Invalid amount validation', 'POST', '/invest', { projectId: 'p1', amount: 100 }, 400));
  results.push(await test('Invalid project ID validation', 'POST', '/invest', { projectId: '', amount: 5000 }, 400));

  console.log('\n═══════════════════════════════════════════════════════════════');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passed === total) {
    console.log('✅ ALL BACKEND FIXES VERIFIED - VALIDATION IS WORKING!');
  } else {
    console.log(`⚠️  ${total - passed} assertion(s) need attention.`);
  }
}

main().catch(console.error);
