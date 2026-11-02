import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => page.addInitScript(() => sessionStorage.setItem("booted", "1")));

test("windows and icons can't be dragged off screen, canvas can't be panned away", async ({ page }) => {
  await page.goto("/");
  const vp = page.viewportSize()!;
  const term = page.getByRole("dialog", { name: "guest@anish:~" });
  const title = term.locator(".window-title");
  const b = (await title.boundingBox())!;
  await page.mouse.move(b.x + 100, b.y + 5);
  await page.mouse.down();
  await page.mouse.move(b.x + 3000, b.y + 3000, { steps: 10 });
  await page.mouse.up();
  const after = (await term.boundingBox())!;
  expect(after.x + after.width).toBeLessThanOrEqual(vp.width + 1);
  expect(after.y + after.height).toBeLessThanOrEqual(vp.height + 1);

  const icon = page.getByRole("button", { name: "Resume.pdf" });
  const ib = (await icon.boundingBox())!;
  await page.mouse.move(ib.x + 10, ib.y + 10);
  await page.mouse.down();
  await page.mouse.move(-500, -500, { steps: 10 });
  await page.mouse.up();
  const ia = (await icon.boundingBox())!;
  expect(ia.x).toBeGreaterThanOrEqual(-1);
  expect(ia.y).toBeGreaterThanOrEqual(-1);

  // drag the empty background: nothing should move
  await page.mouse.move(vp.width / 2, vp.height - 60);
  await page.mouse.down();
  await page.mouse.move(vp.width / 2 + 600, vp.height + 400, { steps: 10 });
  await page.mouse.up();
  expect((await icon.boundingBox())!.x).toBeCloseTo(ia.x, 0);

  // scrolling doesn't zoom, and the page never scrolls
  await page.mouse.wheel(0, -800);
  await page.mouse.wheel(0, 800);
  expect((await icon.boundingBox())!.width).toBeCloseTo(ia.width, 0);
  const overflow = await page.evaluate(() => [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight, scrollX, scrollY]);
  expect(overflow).toEqual([0, 0, 0, 0]);
});
