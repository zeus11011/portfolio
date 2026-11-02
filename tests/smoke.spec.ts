import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => page.addInitScript(() => sessionStorage.setItem("booted", "1")));

test("first view has the recruiter essentials", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Resume.pdf", "About Me.txt", "Projects", "Contact", "Ask Me (AI)", "Recycle Bin"])
    await expect(page.getByRole("button", { name })).toBeVisible();
});

test("name banner says who this is", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Anish Naik, software & AI developer, open to work/ })).toBeAttached();
  await expect(page.getByText("software & AI developer · open to work")).toBeVisible();
});

test("system panel shows role, location, modules and status", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByRole("region", { name: "system info" });
  await expect(panel).toContainText("Software Engineer @ Infuse (useMango)");
  await expect(panel).toContainText(/\d+y \d+m since Aug 2023/);
  await expect(panel).toContainText("Goa, India");
  await expect(panel).toContainText("python · aws · ci-cd"); // from skills.json
  await expect(panel).toContainText("Express");
  await expect(panel).not.toContainText("prod");
  await expect(panel).not.toContainText("|"); // no self-rated bars
  await expect(panel).toContainText("open to work backend / applied AI");
});

test("crt starts off, toggle turns effects on and remembers it", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-crt", "off");
  await expect(page.locator(".crt-overlay")).toBeHidden();
  await page.getByLabel("system menu").click();
  await page.getByRole("button", { name: "crt: off" }).click();
  await expect(html).toHaveAttribute("data-crt", "on");
  await expect(page.locator(".crt-overlay")).toBeVisible();
  await page.reload();
  await expect(html).toHaveAttribute("data-crt", "on");
});
