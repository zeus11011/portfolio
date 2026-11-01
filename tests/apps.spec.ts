import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
  await page.goto("/");
});

async function sh(page: Page, cmd: string) {
  const input = page.getByLabel("Terminal input");
  await input.fill(cmd);
  await input.press("Enter");
}

test("subtitles demo plays captions", async ({ page }) => {
  await sh(page, "open projects/.live-subtitles/demo");
  const win = page.getByRole("dialog", { name: "~/projects/.live-subtitles/demo" });
  await win.getByRole("button", { name: "[ play ]" }).click();
  await expect(win).toContainText("sample caption track", { timeout: 5000 });
  await expect(win.getByRole("button", { name: "[ pause ]" })).toBeVisible();
});

test("agent terminal replays the run to a summary", async ({ page }) => {
  await sh(page, "open projects/browser-testing-agent/replay");
  const win = page.getByRole("dialog", { name: "~/projects/browser-testing-agent/replay" });
  await expect(win).toContainText("PASS  launchBrowser");
  await expect(win).toContainText("↻ healed #add-to-cart");
  await expect(win).toContainText("PASSED · 6/6 passed", { timeout: 10000 });
  await win.getByRole("button", { name: "[ replay ]" }).click();
  await expect(win).not.toContainText("PASSED · 6/6 passed");
});

test("mail form validates, control panel lists skills, resume renders", async ({ page }) => {
  await page.getByRole("button", { name: "Contact" }).dblclick();
  const mail = page.getByRole("dialog", { name: "~/contact.sh" });
  await expect(mail.getByRole("link", { name: "github" })).toHaveAttribute("href", /github\.com/);
  await expect(mail.getByLabel("email")).toHaveAttribute("required", "");

  await sh(page, "open etc/skills.cfg");
  await expect(page.getByRole("dialog", { name: "~/etc/skills.cfg" })).toContainText("installed programs");

  await page.getByRole("button", { name: "Resume.pdf" }).dblclick();
  const pdf = page.getByRole("dialog", { name: "~/resume.pdf" });
  await expect(pdf).toContainText(/1\/\d+/, { timeout: 15000 });
  await expect(pdf.getByRole("link", { name: "[ download ]" })).toHaveAttribute("download", "");
  // page actually painted: phosphor background pixel, not blank/white
  await expect
    .poll(() => pdf.locator("canvas").evaluate((c: HTMLCanvasElement) => Math.max(...c.getContext("2d")!.getImageData(2, 2, 1, 1).data.slice(0, 3))))
    .toBeLessThan(20);
});
