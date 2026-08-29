import { expect, test } from '@playwright/test';

test('shows a large clock, API status, and all external links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('time')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  await expect(page.getByText('API online')).toBeVisible();
  await expect(page.getByRole('link', { name: 'YouTube' })).toHaveAttribute(
    'href',
    'https://www.youtube.com/',
  );
  await expect(page.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/');
  await expect(page.getByRole('link', { name: 'ChatGPT' })).toHaveAttribute(
    'href',
    'https://chatgpt.com/',
  );
  await expect(page.getByRole('link', { name: 'Claude' })).toHaveAttribute(
    'href',
    'https://claude.ai/',
  );
});
