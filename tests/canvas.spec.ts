import { test, expect } from "@playwright/test";

test.beforeEach(({ page }) => page.addInitScript(() => sessionStorage.setItem("booted", "1")));

test("open a file, browse a folder, close a window", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About Me.txt" }).dblclick();
  const about = page.getByRole("dialog", { name: "~/about.txt" });
  await expect(about.getByRole("heading", { name: "Anish Naik" })).toBeVisible();
  // windows open at the click, so this one covers the Projects icon: close it first
  await page.getByRole("button", { name: "Close ~/about.txt" }).click();
  await expect(about).toBeHidden();

  await page.getByRole("button", { name: "Projects" }).dblclick();
  const explorer = page.locator('.react-flow__node[data-id="win:projects"]');
  await explorer.getByRole("button", { name: "browser-testing-agent/" }).click();
  await expect(explorer.getByRole("dialog", { name: "~/projects/browser-testing-agent" })).toBeVisible(); // title follows
  await explorer.getByRole("button", { name: "[^ up]" }).click();
  await expect(explorer.getByRole("button", { name: "rag-engine/" })).toBeVisible();
  await explorer.getByRole("button", { name: "[< back]" }).click();
  await explorer.getByRole("button", { name: "README.md" }).click();
  await expect(page.getByRole("dialog", { name: "~/projects/browser-testing-agent/README.md" }).getByRole("heading", { name: "Browser Testing Agent (browser-harness)" })).toBeVisible();
});

test("window drags by title bar, layout persists, reset restores it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About Me.txt" }).dblclick();
  const win = page.getByRole("dialog", { name: "~/about.txt" });
  const title = win.locator(".window-title");
  const before = (await win.boundingBox())!;
  await title.hover({ position: { x: 300, y: 5 } });
  await page.mouse.down();
  await page.mouse.move(before.x - 300, before.y + 200, { steps: 5 });
  await page.mouse.up();
  const after = (await win.boundingBox())!;
  expect(before.x - after.x).toBeGreaterThan(100);

  const node = page.locator('.react-flow__node[data-id="win:about.txt"]');
  const moved = await node.getAttribute("style");
  await page.reload();
  await expect(win).toBeVisible();
  expect(await node.getAttribute("style")).toBe(moved);

  await page.getByLabel("system menu").click();
  await page.getByRole("button", { name: "reset layout" }).click();
  await expect(win).toBeHidden();
});

test("windows resize from the corner, and the size persists", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await page.getByRole("button", { name: "About Me.txt" }).click();
  const node = page.locator('.react-flow__node[data-id="win:about.txt"]');
  await expect(node.getByRole("heading", { name: "Anish Naik" })).toBeVisible();
  await page.waitForTimeout(400); // power-on animation
  const before = (await node.boundingBox())!;
  await page.mouse.move(before.x + before.width - 2, before.y + before.height - 2);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width + 200, before.y + before.height + 150, { steps: 8 });
  await page.mouse.up();
  const after = (await node.boundingBox())!;
  expect(after.width).toBeGreaterThan(before.width + 150);
  expect(after.height).toBeGreaterThan(before.height + 100);
  // the frame follows the new size: bottom border sits at the node's bottom
  const frame = (await node.getByRole("dialog").boundingBox())!;
  expect(Math.abs(frame.y + frame.height - (after.y + after.height))).toBeLessThan(4);

  await page.reload();
  await expect(node).toBeVisible();
  expect(Math.abs((await node.boundingBox())!.width - after.width)).toBeLessThan(2);
});

test(".url opens a new tab", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Projects" }).dblclick();
  await page.getByRole("button", { name: "browser-testing-agent/" }).click();
  const popup = context.waitForEvent("page");
  await page.getByRole("button", { name: "github.url" }).click();
  expect((await popup).url()).toContain("github.com");
});

test("projects are desktop apps: README plus launch buttons", async ({ page, context }) => {
  await page.goto("/");
  for (const [label, path, heading] of [
    ["RAG Engine", "projects/rag-engine", "rag-engine"],
    ["CHIP-8", "projects/chip-8-emulator", "CHIP-8 Emulator"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).dblclick();
    const app = page.getByRole("dialog", { name: `~/${path}` });
    await expect(app.getByRole("heading", { name: heading })).toBeVisible();
    const popup = context.waitForEvent("page");
    await app.getByRole("button", { name: "↗ github" }).click();
    expect((await popup).url()).toContain("github.com");
    await app.getByRole("button", { name: `Close ~/${path}` }).click();
  }

  await page.getByRole("button", { name: "Test Agent", exact: true }).dblclick();
  await page.getByRole("dialog", { name: "~/projects/browser-testing-agent" }).getByRole("button", { name: "▶ run replay" }).click();
  await expect(page.getByRole("dialog", { name: "~/projects/browser-testing-agent/replay" })).toBeVisible();
});

test("an icon dropped on another icon moves to a free spot", async ({ page }) => {
  await page.goto("/");
  const about = page.getByRole("button", { name: "About Me.txt" });
  const resume = page.getByRole("button", { name: "Resume.pdf" });
  const a = (await about.boundingBox())!;
  const r = (await resume.boundingBox())!;
  await page.mouse.move(a.x + 20, a.y + 20);
  await page.mouse.down();
  await page.mouse.move(r.x + 20, r.y + 20, { steps: 10 });
  await page.mouse.up();
  await expect(async () => {
    const icons = await page.locator(".react-flow__node-icon").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    for (const [i, p] of icons.entries())
      for (const q of icons.slice(i + 1))
        expect(p.x < q.x + q.width && q.x < p.x + p.width && p.y < q.y + q.height && q.y < p.y + p.height).toBe(false);
  }).toPass();
});

test("top bar Activities menu opens any desktop app", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Activities").click();
  await page.getByRole("navigation").getByRole("button", { name: "About Me.txt" }).click();
  await expect(page.locator('.react-flow__node[data-id="win:about.txt"]')).toBeVisible();
  await expect(page.getByRole("navigation")).toBeHidden(); // menu closed after picking
});

for (const [w, h] of [[1280, 600], [1280, 720], [1920, 1080], [390, 844]])
  test(`${w}x${h}: a README window opens in the middle, on screen, off the icons and terminal`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.getByRole("button", { name: "Test Agent", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "~/projects/browser-testing-agent" })).toBeVisible();
    const b = (await page.locator('.react-flow__node[data-id="win:projects/browser-testing-agent"]').boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(h);
    expect(b.x + b.width).toBeLessThanOrEqual(w);
    if (w < 1200) return; // phones have no free space beside the icons
    const others = await page.locator(".react-flow__node-icon, .react-flow__node-terminal, .react-flow__node-note").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    for (const o of others) expect(b.x >= o.x + o.width || b.y >= o.y + o.height).toBe(true);
    // wide enough for the middle to hold it: the name panel stays uncovered too
    const panel = (await page.getByRole("region", { name: "system info" }).boundingBox())!;
    if (w >= 1920) expect(b.x + b.width).toBeLessThanOrEqual(panel.x);
  });

test("wide screens: the agent replay auto-plays in the middle, on screen", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  const replay = page.getByRole("dialog", { name: "~/projects/browser-testing-agent/replay" });
  await expect(replay).toContainText("browser-auto run");
  const b = (await page.locator('.react-flow__node[data-id="win:projects/browser-testing-agent/replay"]').boundingBox())!;
  const panel = (await page.getByRole("region", { name: "system info" }).boundingBox())!;
  const term = (await page.locator(".react-flow__node-terminal").boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(term.x + term.width);
  expect(b.x + b.width).toBeLessThanOrEqual(panel.x);
  expect(b.y + b.height).toBeLessThanOrEqual(1080);
});
