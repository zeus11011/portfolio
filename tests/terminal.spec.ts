import { test, expect, type Page } from "@playwright/test";

const term = (page: Page) => page.getByRole("dialog", { name: "guest@anish: ~" });
async function type(page: Page, cmd: string) {
  const input = page.getByLabel("Terminal input");
  await input.fill(cmd);
  await input.press("Enter");
}

test("boot log plays once per session and any key skips it", async ({ page }) => {
  await page.goto("/");
  const boot = page.locator(".boot");
  await expect(boot).toContainText("GUEST-BIOS");
  await page.keyboard.press("x");
  await expect(boot).toBeHidden();
  await page.reload();
  await expect(boot).toBeHidden();
});

test.describe("shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("booted", "1"));
    await page.goto("/");
  });

  test("help, ls with clickable names, cd, cat", async ({ page }) => {
    await type(page, "help");
    await expect(term(page)).toContainText("open <name>");
    await type(page, "cd projects");
    await expect(term(page)).toContainText("guest@anish:~/projects$");
    await type(page, "ls");
    await term(page).getByRole("button", { name: "live-subtitles/" }).click();
    await expect(page.getByRole("dialog", { name: "~/projects/live-subtitles" })).toBeVisible();
    await type(page, "cat ../about.txt");
    await expect(term(page)).toContainText("Software and AI developer.");
    await type(page, "cd nope");
    await expect(term(page)).toContainText("cd: nope: No such file or directory");
  });

  test("open resume, run an executable by name, unknown command", async ({ page }) => {
    await type(page, "open resume");
    await expect(page.getByRole("dialog", { name: "~/resume.pdf" })).toBeVisible();
    await type(page, "cd projects/live-subtitles");
    await type(page, "demo");
    await expect(page.getByRole("dialog", { name: "~/projects/live-subtitles/demo" })).toBeVisible();
    await type(page, "frobnicate");
    await expect(term(page)).toContainText("bash: frobnicate: command not found");
  });

  test("whoami, contact, sudo hire-me, crt off, clear", async ({ page }) => {
    await type(page, "whoami");
    await expect(term(page)).toContainText("Anish Naik's portfolio");
    await type(page, "sudo hire-me");
    await expect(term(page)).toContainText("access granted");
    await expect(page.getByRole("dialog", { name: "~/contact.sh" })).toBeVisible();
    await type(page, "crt off");
    await expect(page.locator("html")).toHaveAttribute("data-crt", "off");
    await type(page, "clear");
    await expect(term(page)).not.toContainText("whoami");
  });

  test("rm -rf / panics, any key reboots", async ({ page }) => {
    await type(page, "rm -rf /");
    await expect(page.getByText("Kernel panic - not syncing")).toBeVisible();
    await page.waitForTimeout(400);
    await page.keyboard.press("Space");
    // reloads (the init script above re-marks the session booted, so no boot log here)
    await expect(page.getByText("Kernel panic - not syncing")).toBeHidden();
  });

  test("tab completes commands and paths, lists options when ambiguous", async ({ page }) => {
    const input = page.getByLabel("Terminal input");
    await input.fill("who");
    await input.press("Tab");
    await expect(input).toHaveValue("whoami ");

    await input.fill("cd pro");
    await input.press("Tab");
    await expect(input).toHaveValue("cd projects/");
    await input.press("Tab");
    await expect(input).toHaveValue("cd projects/");
    await expect(term(page)).toContainText("live-subtitles/  browser-testing-agent/  rag-engine/  chip-8-emulator/  more/");

    await input.fill("cat projects/live-subtitles/R");
    await input.press("Tab");
    await expect(input).toHaveValue("cat projects/live-subtitles/README.md ");

    await input.fill("c");
    await input.press("Tab");
    await expect(input).toHaveValue("c");
    await input.press("Tab");
    await expect(term(page)).toContainText("cat  cd  clear  contact  crt");
  });

  test("hidden guess game", async ({ page }) => {
    await type(page, "guess");
    await expect(term(page)).toContainText("GUESS THE NUMBER");
    let lo = 1, hi = 100;
    for (let i = 0; i < 8; i++) {
      const n = Math.floor((lo + hi) / 2);
      await type(page, String(n));
      const out = term(page).locator(".whitespace-pre-wrap").last();
      await expect(out).toHaveText(/higher|lower|got it/);
      const last = (await out.textContent())!;
      if (last.includes("got it")) return;
      if (last.includes("higher")) lo = n + 1;
      else hi = n - 1;
    }
    throw new Error("binary search should win in 7 tries");
  });
});
