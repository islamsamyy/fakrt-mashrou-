const http = require('http')

const API_BASE = 'http://localhost:3000'

const results = []

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          headers: res.headers,
        })
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function runTest(id, name, method, path, data, expectedStatus) {
  const startTime = Date.now()
  try {
    const response = await makeRequest(method, path, data)
    const duration = Date.now() - startTime
    const passed = response.status === expectedStatus

    results.push({
      id,
      name,
      status: passed ? 'PASS' : 'FAIL',
      expectedStatus,
      actualStatus: response.status,
      duration,
      error: !passed ? `Expected ${expectedStatus}, got ${response.status}` : undefined,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    results.push({
      id,
      name,
      status: 'FAIL',
      expectedStatus,
      duration,
      error: error.message,
    })
  }
}

async function runAllTests() {
  console.log('🧪 Starting Backend API Tests...\n')

  // Authentication Tests - Registration
  console.log('📝 Testing User Registration API...')
  await runTest(
    'auth_register_success',
    'Register new user with valid data',
    'POST',
    '/api/auth/register',
    {
      fullName: `Test User ${Date.now()}`,
      email: `test.${Date.now()}@example.com`,
      password: 'TestPassword123',
      role: 'investor',
    },
    201
  )

  await runTest(
    'auth_register_missing_email',
    'Register without email',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      email: '',
      password: 'TestPassword123',
      role: 'investor',
    },
    400
  )

  await runTest(
    'auth_register_missing_password',
    'Register without password',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      email: 'test@example.com',
      password: '',
      role: 'investor',
    },
    400
  )

  await runTest(
    'auth_register_missing_fullname',
    'Register without full name',
    'POST',
    '/api/auth/register',
    {
      fullName: '',
      email: 'test@example.com',
      password: 'TestPassword123',
      role: 'investor',
    },
    400
  )

  await runTest(
    'auth_register_weak_password',
    'Register with weak password (< 8 chars)',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'weak',
      role: 'investor',
    },
    400
  )

  await runTest(
    'auth_register_invalid_email',
    'Register with invalid email format',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      email: 'invalid..email@example.com',
      password: 'TestPassword123',
      role: 'investor',
    },
    400
  )

  await runTest(
    'auth_register_invalid_role',
    'Register with invalid role (admin)',
    'POST',
    '/api/auth/register',
    {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
      role: 'admin',
    },
    400
  )

  // Authentication Tests - Login
  console.log('\n🔐 Testing User Login API...')
  await runTest(
    'auth_login_missing_email',
    'Login without email',
    'POST',
    '/api/auth/login',
    {
      email: '',
      password: 'TestPassword123',
    },
    400
  )

  await runTest(
    'auth_login_missing_password',
    'Login without password',
    'POST',
    '/api/auth/login',
    {
      email: 'test@example.com',
      password: '',
    },
    400
  )

  await runTest(
    'auth_login_invalid_credentials',
    'Login with wrong credentials',
    'POST',
    '/api/auth/login',
    {
      email: 'nonexistent@example.com',
      password: 'WrongPassword123',
    },
    401
  )

  // Investment API Tests
  console.log('\n💰 Testing Investment API...')
  await runTest(
    'invest_no_auth',
    'Invest without authentication',
    'POST',
    '/api/invest',
    {
      projectId: '1',
      amount: 10000,
    },
    401
  )

  // Matching API Tests
  console.log('\n🎯 Testing Matching API...')
  await runTest(
    'match_no_auth',
    'Get matches without authentication',
    'GET',
    '/api/match',
    null,
    401
  )

  // Print Results
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(80))

  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const total = results.length

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌'
    console.log(`${icon} ${result.id}: ${result.name}`)
    if (result.status === 'FAIL') {
      console.log(`   → ${result.error}`)
    }
    console.log(`   ⏱️  ${result.duration}ms`)
  })

  console.log('\n' + '='.repeat(80))
  console.log(`Results: ${passed} passed, ${failed} failed, ${total} total`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`)
  console.log('='.repeat(80))

  // Write detailed report
  const fs = require('fs')
  const report = `# Backend API Test Report

**Date**: ${new Date().toISOString()}
**Total Tests**: ${total}
**Passed**: ${passed} ✅
**Failed**: ${failed} ❌
**Success Rate**: ${((passed / total) * 100).toFixed(2)}%

## Test Results

${results
  .map(
    (r) => `
### ${r.id}
- **Name**: ${r.name}
- **Status**: ${r.status}
- **Expected**: ${r.expectedStatus}
- **Actual**: ${r.actualStatus || 'N/A'}
- **Duration**: ${r.duration}ms
${r.error ? `- **Error**: ${r.error}` : ''}
`
  )
  .join('\n')}

## Summary

${
  failed === 0
    ? '✅ All tests passed! Backend API is working correctly.'
    : `⚠️ ${failed} test(s) failed. Review errors above and fix issues.`
}
`

  fs.writeFileSync('testsprite_tests/BACKEND_TEST_REPORT.md', report)

  console.log('\n📄 Detailed report saved to: testsprite_tests/BACKEND_TEST_REPORT.md')
  process.exit(failed > 0 ? 1 : 0)
}

runAllTests().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
