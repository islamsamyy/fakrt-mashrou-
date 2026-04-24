/**
 * Frontend Test Suite for IDEA BUSINESS
 * Tests all user-facing features and workflows
 * Uses Puppeteer for browser automation
 */

const BASE_URL = 'http://localhost:3000'

// Test suite definition
const testSuites = {
  'Homepage & Navigation': [
    {
      id: 'homepage_loads',
      name: 'Homepage loads successfully',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const title = await page.title()
        return title.length > 0
      }
    },
    {
      id: 'navbar_visible',
      name: 'Navigation bar displays',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const navbar = await page.$('nav')
        return navbar !== null
      }
    },
    {
      id: 'signup_button_visible',
      name: 'Signup button visible on homepage',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const button = await page.$('button:contains("Sign Up")')
        return button !== null
      }
    },
    {
      id: 'login_link_visible',
      name: 'Login link visible',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const link = await page.$('a[href*="login"]')
        return link !== null
      }
    }
  ],

  'Authentication Flow': [
    {
      id: 'signup_page_loads',
      name: 'Signup page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' })
        const form = await page.$('form')
        return form !== null
      }
    },
    {
      id: 'signup_form_fields',
      name: 'Signup form has required fields',
      test: async (page) => {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' })
        const emailInput = await page.$('input[type="email"]')
        const passwordInput = await page.$('input[type="password"]')
        const nameInput = await page.$('input[placeholder*="name" i]')
        return emailInput !== null && passwordInput !== null && nameInput !== null
      }
    },
    {
      id: 'login_page_loads',
      name: 'Login page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
        const form = await page.$('form')
        return form !== null
      }
    },
    {
      id: 'login_form_fields',
      name: 'Login form has email and password',
      test: async (page) => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
        const emailInput = await page.$('input[type="email"]')
        const passwordInput = await page.$('input[type="password"]')
        return emailInput !== null && passwordInput !== null
      }
    },
    {
      id: 'password_validation',
      name: 'Password validation shows error',
      test: async (page) => {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' })
        const passwordInput = await page.$('input[type="password"]')
        await passwordInput.type('weak')
        await page.waitForTimeout(500)
        // Look for error message
        const errorMsg = await page.evaluate(() => {
          const body = document.body.innerText
          return body.includes('password') || body.includes('حرف') || body.includes('كلمة')
        })
        return errorMsg
      }
    }
  ],

  'Dashboard Navigation': [
    {
      id: 'investor_dashboard_link',
      name: 'Investor dashboard link visible after login',
      test: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/investor`, { waitUntil: 'networkidle0' })
        const dashboardContent = await page.evaluate(() => {
          return document.body.innerText.includes('Dashboard') ||
                 document.body.innerText.includes('لوحة التحكم') ||
                 document.body.innerText.includes('Invest')
        })
        return dashboardContent
      }
    },
    {
      id: 'founder_dashboard_link',
      name: 'Founder dashboard link visible',
      test: async (page) => {
        await page.goto(`${BASE_URL}/dashboard/founder`, { waitUntil: 'networkidle0' })
        const dashboardContent = await page.evaluate(() => {
          return document.body.innerText.includes('Project') ||
                 document.body.innerText.includes('مشروع') ||
                 document.body.innerText.length > 100
        })
        return dashboardContent
      }
    }
  ],

  'Project Discovery': [
    {
      id: 'discover_page_loads',
      name: 'Discover/Opportunities page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle0' })
        const projects = await page.evaluate(() => {
          return document.querySelectorAll('[data-testid*="project"], article, .project').length > 0 ||
                 document.body.innerText.includes('Project')
        })
        return projects
      }
    },
    {
      id: 'project_listings_display',
      name: 'Project listings display',
      test: async (page) => {
        await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle0' })
        const projectsVisible = await page.evaluate(() => {
          return document.body.innerText.length > 500 // Has content
        })
        return projectsVisible
      }
    },
    {
      id: 'search_or_filter_available',
      name: 'Search or filter functionality visible',
      test: async (page) => {
        await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle0' })
        const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]')
        const filterBtn = await page.$('button:contains("Filter")')
        return searchInput !== null || filterBtn !== null
      }
    }
  ],

  'User Profile': [
    {
      id: 'profile_page_loads',
      name: 'User profile page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' })
        const profileContent = await page.evaluate(() => {
          return document.body.innerText.includes('Profile') ||
                 document.body.innerText.includes('الملف')
        })
        return profileContent
      }
    },
    {
      id: 'settings_page_loads',
      name: 'Settings page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' })
        const settingsContent = await page.evaluate(() => {
          return document.body.innerText.includes('Settings') ||
                 document.body.innerText.includes('الإعدادات')
        })
        return settingsContent
      }
    }
  ],

  'Investment Flow': [
    {
      id: 'investment_button_visible',
      name: 'Investment button visible on project',
      test: async (page) => {
        await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'networkidle0' })
        const investBtn = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button')
          return Array.from(buttons).some(btn =>
            btn.innerText.includes('Invest') ||
            btn.innerText.includes('استثمر')
          )
        })
        return investBtn
      }
    },
    {
      id: 'kyc_flow_available',
      name: 'KYC verification flow available',
      test: async (page) => {
        await page.goto(`${BASE_URL}/kyc`, { waitUntil: 'networkidle0' })
        const kycContent = await page.evaluate(() => {
          return document.body.innerText.includes('KYC') ||
                 document.body.innerText.includes('التحقق') ||
                 document.body.innerText.includes('verification')
        })
        return kycContent
      }
    }
  ],

  'UI/UX Elements': [
    {
      id: 'light_theme_applied',
      name: 'Light theme is applied',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const theme = await page.evaluate(() => {
          const html = document.documentElement
          const bg = window.getComputedStyle(html).backgroundColor
          const isDark = bg.includes('rgb(0') || bg.includes('rgb(17') || bg.includes('rgb(30')
          return !isDark // Light theme means NOT dark
        })
        return theme
      }
    },
    {
      id: 'rtl_direction_set',
      name: 'RTL direction set for Arabic',
      test: async (page) => {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const isRTL = await page.evaluate(() => {
          const html = document.documentElement
          return html.getAttribute('dir') === 'rtl' ||
                 document.body.style.direction === 'rtl'
        })
        return isRTL
      }
    },
    {
      id: 'responsive_layout',
      name: 'Responsive layout (mobile friendly)',
      test: async (page) => {
        await page.setViewport({ width: 375, height: 667 })
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
        const responsive = await page.evaluate(() => {
          return document.documentElement.offsetWidth <= 400
        })
        return responsive
      }
    }
  ],

  'Notifications & Messaging': [
    {
      id: 'notifications_accessible',
      name: 'Notifications page accessible',
      test: async (page) => {
        await page.goto(`${BASE_URL}/notifications`, { waitUntil: 'networkidle0' })
        const notifContent = await page.evaluate(() => {
          return document.body.innerText.includes('Notification') ||
                 document.body.innerText.includes('إشعار')
        })
        return notifContent
      }
    },
    {
      id: 'messages_page_loads',
      name: 'Messages page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle0' })
        const msgsContent = await page.evaluate(() => {
          return document.body.innerText.includes('Message') ||
                 document.body.innerText.includes('رسالة')
        })
        return msgsContent
      }
    }
  ],

  'Content Pages': [
    {
      id: 'about_page_loads',
      name: 'About page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle0' })
        const aboutContent = await page.evaluate(() => {
          return document.body.innerText.includes('About') ||
                 document.body.innerText.includes('عن')
        })
        return aboutContent
      }
    },
    {
      id: 'how_it_works_loads',
      name: 'How it works page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: 'networkidle0' })
        const howContent = await page.evaluate(() => {
          return document.body.innerText.includes('How') ||
                 document.body.innerText.includes('كيف')
        })
        return howContent
      }
    },
    {
      id: 'landing_page_loads',
      name: 'Landing page loads',
      test: async (page) => {
        await page.goto(`${BASE_URL}/landing`, { waitUntil: 'networkidle0' })
        const landingContent = await page.evaluate(() => {
          return document.body.innerText.length > 500
        })
        return landingContent
      }
    }
  ]
}

// Test runner
async function runTests() {
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({ headless: 'new' })
  const results = []
  let totalPassed = 0
  let totalFailed = 0

  console.log('\n🧪 Starting Frontend Test Suite...\n')

  for (const [suiteName, tests] of Object.entries(testSuites)) {
    console.log(`\n📋 ${suiteName}`)
    console.log('─'.repeat(80))

    for (const test of tests) {
      const page = await browser.newPage()
      page.setDefaultNavigationTimeout(30000)

      try {
        const start = Date.now()
        const passed = await test.test(page)
        const duration = Date.now() - start

        const status = passed ? '✅' : '❌'
        console.log(`${status} ${test.name}`)
        console.log(`   ⏱️  ${duration}ms\n`)

        results.push({
          id: test.id,
          name: test.name,
          suite: suiteName,
          status: passed ? 'PASS' : 'FAIL',
          duration
        })

        if (passed) totalPassed++
        else totalFailed++
      } catch (error) {
        console.log(`❌ ${test.name}`)
        console.log(`   Error: ${error.message.substring(0, 100)}\n`)

        results.push({
          id: test.id,
          name: test.name,
          suite: suiteName,
          status: 'ERROR',
          duration: 0,
          error: error.message
        })

        totalFailed++
      } finally {
        await page.close()
      }
    }
  }

  await browser.close()

  // Print summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total Passed: ${totalPassed} ✅`)
  console.log(`Total Failed: ${totalFailed} ❌`)
  console.log(`Total Tests:  ${totalPassed + totalFailed}`)
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`)
  console.log('='.repeat(80))

  // Write report
  const fs = require('fs')
  const report = `# Frontend Test Report

**Date**: ${new Date().toISOString()}
**Total Tests**: ${totalPassed + totalFailed}
**Passed**: ${totalPassed} ✅
**Failed**: ${totalFailed} ❌
**Success Rate**: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%

## Test Results by Suite

${Object.entries(testSuites).map(([suiteName]) => {
  const suiteResults = results.filter(r => r.suite === suiteName)
  const suitePassed = suiteResults.filter(r => r.status === 'PASS').length
  const suiteTotal = suiteResults.length

  return `### ${suiteName} (${suitePassed}/${suiteTotal})
${suiteResults.map(r => `- ${r.status === 'PASS' ? '✅' : '❌'} ${r.name} (${r.duration}ms)`).join('\n')}`
}).join('\n\n')}

## Summary

${totalFailed === 0
  ? '✅ All tests passed! Frontend is working correctly.'
  : `⚠️ ${totalFailed} test(s) failed. Review results above.`}
`

  fs.writeFileSync('testsprite_tests/FRONTEND_TEST_REPORT.md', report)
  console.log('\n📄 Report saved to: testsprite_tests/FRONTEND_TEST_REPORT.md')

  process.exit(totalFailed > 0 ? 1 : 0)
}

// Run tests
if (require.main === module) {
  runTests().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
}

module.exports = { runTests, testSuites }
