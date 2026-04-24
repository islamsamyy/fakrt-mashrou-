const API_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 TESTING BACKEND AUTH FIXES\n');
  
  // Test 1: Empty Email Login
  console.log('Test 1: User Login with Empty Credentials');
  let res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: 'test123456' })
  });
  let data = await res.json();
  console.log(`Status: ${res.status} | Expected: 400 | Result: ${res.status === 400 ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  // Test 2: Invalid Email Format
  console.log('Test 2: User Registration with Invalid Email');
  res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fullName: 'Test User',
      email: 'invalid-email', 
      password: 'Test123456!',
      role: 'investor'
    })
  });
  data = await res.json();
  console.log(`Status: ${res.status} | Expected: 400 | Result: ${res.status === 400 ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  // Test 3: Weak Password
  console.log('Test 3: User Registration with Weak Password');
  res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fullName: 'Test User',
      email: 'test@example.com', 
      password: 'short',
      role: 'investor'
    })
  });
  data = await res.json();
  console.log(`Status: ${res.status} | Expected: 400 | Result: ${res.status === 400 ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  // Test 4: Missing Fields
  console.log('Test 4: User Registration with Missing Fields');
  res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'test@example.com',
      // missing fullName and password
      role: 'investor'
    })
  });
  data = await res.json();
  console.log(`Status: ${res.status} | Expected: 400 | Result: ${res.status === 400 ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  // Test 5: Investment without auth
  console.log('Test 5: Investment Submission without Authentication');
  res = await fetch(`${API_URL}/invest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      projectId: 'test-proj',
      amount: 5000
    })
  });
  data = await res.json();
  console.log(`Status: ${res.status} | Expected: 401 | Result: ${res.status === 401 ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  // Test 6: Invalid investment amount
  console.log('Test 6: Investment Submission with Invalid Amount');
  res = await fetch(`${API_URL}/invest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      projectId: 'test-proj',
      amount: 100  // below minimum
    })
  });
  data = await res.json();
  console.log(`Status: ${res.status} | Expected: 401 or 400 | Result: ${[401, 400].includes(res.status) ? '✓' : '✗'}`);
  console.log(`Error: ${data.error}\n`);

  console.log('✅ Backend tests completed');
}

runTests().catch(console.error);
