import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => page.addInitScript(() => sessionStorage.setItem("booted", "1")));

test("open a file, browse a folder, close a window", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About Me.txt" }).dblclick();
  const about = page.getByRole("dialog", { name: "~/about.txt" });
  await expect(about.getByRole("heading", { name: "Anish Naik" })).toBeVisible();

  await page.getByRole("button", { name: "Projects" }).dblclick();
  const explorer = page.getByRole("dialog", { name: "~/projects" });
  await explorer.getByRole("button", { name: "live-subtitles/" }).click();
  await expect(explorer).toContainText("~/projects/live-subtitles");
  await explorer.getByRole("button", { name: "[^ up]" }).click();
  await expect(explorer.getByRole("button", { name: "browser-testing-agent/" })).toBeVisible();
  await explorer.getByRole("button", { name: "[< back]" }).click();
  await explorer.getByRole("button", { name: "README.md" }).click();
  await expect(page.getByRole("dialog", { name: "~/projects/live-subtitles/README.md" }).getByRole("heading", { name: "Live Subtitles" })).toBeVisible();

  await page.getByRole("button", { name: "Close ~/about.txt" }).click();
  await expect(about).toBeHidden();
});

test("window drags by title bar, layout persists, reset restores it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About Me.txt" }).dblclick();
  const win = page.getByRole("dialog", { name: "~/about.txt" });
  const title = win.locator(".window-title");
  const before = (await win.boundingBox())!;
  await title.hover({ position: { x: 300, y: 5 } });
  await page.mouse.down();
  await page.mouse.move(before.x + 500, before.y + 200, { steps: 5 });
  await page.mouse.up();
  const after = (await win.boundingBox())!;
  expect(after.x - before.x).toBeGreaterThan(100);

  const node = page.locator('.react-flow__node[data-id="win:about.txt"]');
  const moved = await node.getAttribute("style");
  await page.reload();
  await expect(win).toBeVisible();
  expect(await node.getAttribute("style")).toBe(moved);

  await page.getByRole("button", { name: "reset layout" }).click();
  await expect(win).toBeHidden();
});

test(".url opens a new tab", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Projects" }).dblclick();
  await page.getByRole("button", { name: "live-subtitles/" }).click();
  const popup = context.waitForEvent("page");
  await page.getByRole("button", { name: "github.url" }).click();
  expect((await popup).url()).toContain("github.com");
});

test("rag-engine card opens its folder and README", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /\[ rag-engine \]/ }).dblclick();
  const folder = page.getByRole("dialog", { name: "~/projects/rag-engine" });
  await expect(folder.getByRole("button", { name: "github.url" })).toBeVisible();
  await folder.getByRole("button", { name: "README.md" }).click();
  await expect(page.getByRole("dialog", { name: "~/projects/rag-engine/README.md" }).getByRole("heading", { name: "rag-engine" })).toBeVisible();
});
