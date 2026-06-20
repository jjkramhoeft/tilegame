import { test, expect } from '@playwright/test';

test('boots into debug mode, renders, and the player moves on input', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  // ?debug=1 deep-links straight into a seeded GameScene (see preload-scene.ts).
  await page.goto('/?debug=1');

  await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 });

  // Wait until the GameScene is active and the player object exists.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const scene = (window as any).__game?.scene?.getScene?.('game-scene');
            return !!(scene && scene.scene.isActive() && scene.player);
          } catch {
            return false;
          }
        }),
      { timeout: 15_000 },
    )
    .toBe(true);

  const readX = () =>
    page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).__game.scene.getScene('game-scene').player.x as number,
    );

  await page.screenshot({ path: 'test-results/smoke-initial.png' });
  const xBefore = await readX();

  // Walk right for a bit (Phaser listens for keys on the window).
  await page.locator('canvas').click();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowRight');

  const xAfter = await readX();
  await page.screenshot({ path: 'test-results/smoke-after-move.png' });

  expect(xAfter).toBeGreaterThan(xBefore);
  expect(errors, `console / page errors:\n${errors.join('\n')}`).toEqual([]);
});
