import { test, expect } from "@playwright/test";

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["small phone", { width: 360, height: 640 }],
  ["tablet", { width: 768, height: 1024 }],
] as const) {
  test.describe(name, () => {
    test.use({ viewport, hasTouch: true, isMobile: true });

    test("everything fits on screen and one tap opens an icon", async ({ page }) => {
      await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
      await page.goto("/");
      const inView = async (box: { x: number; y: number; width: number; height: number } | null) => {
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
      };
      const icons = page.locator(".react-flow__node-icon");
      for (let i = 0; i < (await icons.count()); i++) await inView(await icons.nth(i).boundingBox());
      await inView(await page.getByRole("dialog", { name: "guest@anish: ~" }).boundingBox());

      await page.getByRole("button", { name: "About Me.txt" }).tap();
      const about = page.getByRole("dialog", { name: "~/about.txt" });
      await expect(about).toBeVisible();
      await inView(await about.boundingBox());

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBe(0);
    });

    test("a layout saved on desktop is re-laid out for this screen", async ({ page }) => {
      await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/");
      await page.getByRole("button", { name: "About Me.txt" }).dblclick(); // saves the desktop layout
      await page.setViewportSize(viewport); // like switching devtools to a device
      const terminal = page.getByRole("dialog", { name: "guest@anish: ~" });
      const icon = page.getByRole("button", { name: "CHIP-8" });
      await expect(async () => {
        const t = (await terminal.boundingBox())!;
        const i = (await icon.boundingBox())!;
        expect(t.y).toBeGreaterThanOrEqual(i.y + i.height); // terminal sits below the icon grid, not on top of it
      }).toPass();
      await expect(page.getByRole("dialog", { name: "~/about.txt" })).toBeVisible(); // open windows kept
    });
  });
}

test("tablet-sized window with a mouse: one click opens an icon", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  // dragging is not a click: moving the icon must not open it
  const resume = page.getByRole("button", { name: "Resume.pdf" });
  const r = (await resume.boundingBox())!;
  await page.mouse.move(r.x + 20, r.y + 20);
  await page.mouse.down();
  await page.mouse.move(r.x + 20, r.y + 400, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole("dialog", { name: "~/resume.pdf" })).toBeHidden();

  await page.getByRole("button", { name: "About Me.txt" }).click();
  await expect(page.getByRole("dialog", { name: "~/about.txt" })).toBeVisible();
});

test("width change reloads the page, height-only change does not", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
  const marker = () => page.evaluate(() => (window as unknown as { marker?: number }).marker);

  await page.setViewportSize({ width: 1280, height: 600 }); // like a phone keyboard opening
  await page.waitForTimeout(600);
  expect(await marker()).toBe(1);

  await page.setViewportSize({ width: 390, height: 600 });
  await expect.poll(marker).toBeUndefined();
  await expect(page.getByRole("button", { name: "Resume.pdf" })).toBeVisible();
});
