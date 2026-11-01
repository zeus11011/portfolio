import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => page.addInitScript(() => sessionStorage.setItem("booted", "1")));

test("first view has the recruiter essentials", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Resume.pdf", "About Me.txt", "Projects", "Contact", "Ask Me (AI)", "Recycle Bin"])
    await expect(page.getByRole("button", { name })).toBeVisible();
});

test("crt toggle turns effects off and remembers it", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-crt", "off");
  await page.getByRole("button", { name: "crt: on" }).click();
  await expect(html).toHaveAttribute("data-crt", "off");
  await expect(page.locator(".crt-overlay")).toBeHidden();
  await page.reload();
  await expect(html).toHaveAttribute("data-crt", "off");
});
