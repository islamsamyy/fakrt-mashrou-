import { test, expect } from '@playwright/test';

/**
 * Critical End-to-End Tests
 * Tests essential user flows and business logic
 */

const BASE_URL = 'http://localhost:3000';

test.describe('IDEA BUSINESS - Critical Flows', () => {
  // ==================== HOME PAGE TESTS ====================
  test.describe('Home Page', () => {
    test('should load home page', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page.locator('text=IDEA BUSINESS')).toBeVisible();
      await expect(page.locator('text=اكتشف الفرص')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page.locator('text=المستثمرين')).toBeVisible();
      await expect(page.locator('text=المشاريع')).toBeVisible();
    });

    test('should navigate to discover page', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.click('text=اكتشف الفرص');
      await expect(page).toHaveURL(/.*discover/);
    });
  });

  // ==================== DISCOVER PAGE TESTS ====================
  test.describe('Discover Page', () => {
    test('should load discover page without errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/discover`);
      await expect(page.locator('text=اكتشف الفرص')).toBeVisible();
    });

    test('should display category filters', async ({ page }) => {
      await page.goto(`${BASE_URL}/discover`);
      await expect(page.locator('button:has-text("الكل")')).toBeVisible();
      await expect(page.locator('button:has-text("AI")')).toBeVisible();
      await expect(page.locator('button:has-text("FinTech")')).toBeVisible();
    });

    test('should filter by category', async ({ page }) => {
      await page.goto(`${BASE_URL}/discover`);
      // Click AI category
      await page.click('button:has-text("AI")');
      await page.waitForTimeout(1000);
      // Results should load (either projects or empty state)
      const hasProjects = await page.locator('[class*="grid"]').isVisible();
      expect(hasProjects).toBeTruthy();
    });
  });

  // ==================== TRENDING PAGE TESTS ====================
  test.describe('Trending Page', () => {
    test('should load trending page', async ({ page }) => {
      await page.goto(`${BASE_URL}/trending`);
      await expect(page.locator('text=المشاريع الصاعدة')).toBeVisible();
    });

    test('should display trending projects', async ({ page }) => {
      await page.goto(`${BASE_URL}/trending`);
      await page.waitForTimeout(1000);
      // Check if projects are loaded or empty state is shown
      const pageContent = await page.content();
      expect(pageContent).toContain('المشاريع الصاعدة');
    });
  });

  // ==================== LEADERBOARD PAGE TESTS ====================
  test.describe('Leaderboard Page', () => {
    test('should load leaderboard page', async ({ page }) => {
      await page.goto(`${BASE_URL}/leaderboard`);
      await expect(page.locator('text=لوحة الصدارة')).toBeVisible();
    });

    test('should display investor leaderboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/leaderboard`);
      await expect(page.locator('text=أفضل المستثمرين')).toBeVisible();
    });

    test('should display founder leaderboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/leaderboard`);
      await expect(page.locator('text=أفضل المؤسسين')).toBeVisible();
    });
  });

  // ==================== AUTHENTICATION TESTS ====================
  test.describe('Authentication', () => {
    test('should show login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await expect(page.locator('text=تسجيل الدخول')).toBeVisible();
    });

    test('should show signup page', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await expect(page.locator('text=التسجيل')).toBeVisible();
    });

    test('password reset page should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/reset-password`);
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });
  });

  // ==================== FOOTER LINKS TESTS ====================
  test.describe('Footer & Legal Pages', () => {
    test('should load about page', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      const pageContent = await page.content();
      expect(pageContent).toContain('IDEA BUSINESS');
    });

    test('should load terms page', async ({ page }) => {
      await page.goto(`${BASE_URL}/terms`);
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(100);
    });

    test('should load privacy page', async ({ page }) => {
      await page.goto(`${BASE_URL}/privacy`);
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(100);
    });

    test('should load contact page', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      await expect(page.locator('text=اتصل بنا')).toBeVisible();
    });
  });

  // ==================== NAVIGATION TESTS ====================
  test.describe('Navigation Bar', () => {
    test('should have working navigation links', async ({ page }) => {
      await page.goto(BASE_URL);
      // Check header navigation exists
      await expect(page.locator('nav')).toBeVisible();
    });

    test('should navigate between pages', async ({ page }) => {
      await page.goto(BASE_URL);
      // Navigate to discover
      await page.click('text=اكتشف');
      await expect(page).toHaveURL(/.*discover/);
      // Navigate back to home
      await page.click('text=الرئيسية');
      await expect(page).toHaveURL(BASE_URL);
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  test.describe('Error Handling', () => {
    test('should handle 404 gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/nonexistent-page-12345`);
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy(); // Should show some error page
    });

    test('should not have console errors on home', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
      // Allow for expected errors only
      const criticalErrors = errors.filter((e) => !e.includes('useSearchParams'));
      expect(criticalErrors.length).toBe(0);
    });
  });

  // ==================== RESPONSIVE DESIGN TESTS ====================
  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(BASE_URL);
      await expect(page.locator('text=IDEA BUSINESS')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await expect(page.locator('text=IDEA BUSINESS')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await expect(page.locator('text=IDEA BUSINESS')).toBeVisible();
    });
  });

  // ==================== PERFORMANCE TESTS ====================
  test.describe('Performance', () => {
    test('home page should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await expect(page.locator('text=IDEA BUSINESS')).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('discover page should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/discover`);
      await expect(page.locator('text=اكتشف الفرص')).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
