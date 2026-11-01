import { test, expect } from "@playwright/test";

for (const [name, viewport] of [
  ["phone", { width: 390, height: 844 }],
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
