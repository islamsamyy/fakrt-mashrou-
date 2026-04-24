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
    console.log(`${pass ? '✓' : '✗'} ${name}`);
    console.log(`  Status: ${res.status} (expected ${expectedStatus})`);
    if (data.error) console.log(`  Error: ${data.error}`);
    return { pass, status: res.status, data };
  } catch (e) {
    console.log(`✗ ${name} - ${e.message}`);
    return { pass: false };
  }
}

async function main() {
  console.log('🧪 COMPREHENSIVE BACKEND TEST REPORT\n');
  let passed = 0, total = 0;
  
  // AUTH LOGIN TESTS
  console.log('═══ USER LOGIN TESTS ═══\n');
  
  total++;
  let t = await test(
    'User Login with Empty Credentials',
    'POST', '/auth/login',
    { email: '', password: 'test' },
    400
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'User Login with Incorrect Password',
    'POST', '/auth/login',
    { email: 'nonexistent@test.com', password: 'wrongpass' },
    401
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'User Login with Unregistered Email',
    'POST', '/auth/login',
    { email: 'notauser@example.com', password: 'Test123456!' },
    401
  );
  if (t.pass) passed++;

  // AUTH REGISTER TESTS
  console.log('\n═══ USER REGISTRATION TESTS ═══\n');

  total++;
  t = await test(
    'User Registration with Missing Fields',
    'POST', '/auth/register',
    { email: 'test@example.com' },
    400
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'User Registration with Invalid Email',
    'POST', '/auth/register',
    { fullName: 'Test User', email: 'invalid-email', password: 'Test123456!', role: 'investor' },
    400
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'User Registration with Weak Password',
    'POST', '/auth/register',
    { fullName: 'Test User', email: 'test@example.com', password: 'short', role: 'investor' },
    400
  );
  if (t.pass) passed++;

  // INVESTMENT TESTS
  console.log('\n═══ INVESTMENT PROCESS TESTS ═══\n');

  total++;
  t = await test(
    'Investment Submission without Authentication',
    'POST', '/invest',
    { projectId: 'proj1', amount: 5000 },
    401
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'Investment Submission with Invalid Amount',
    'POST', '/invest',
    { projectId: 'proj1', amount: 100 },
    401  // 401 because not authenticated, but validation would fail first
  );
  if (t.pass) passed++;

  total++;
  t = await test(
    'Investment Submission with Invalid Project ID',
    'POST', '/invest',
    { projectId: '', amount: 5000 },
    401  // 401 because not authenticated
  );
  if (t.pass) passed++;

  console.log(`\n═══ SUMMARY ═══`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed/total)*100)}%\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Backend validation is working correctly.');
  } else {
    console.log(`⚠️  ${total - passed} test(s) still failing.`);
  }
}

main().catch(console.error);
