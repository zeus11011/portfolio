import { defineConfig } from "@playwright/test";

// Reuses your `npm run dev` if it's running (Next 16 allows only one dev server per project).
// Don't leave a stale `next start` on this port: tests would run against the old build.
const PORT = 3000;

export default defineConfig({
  testDir: "tests",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: { command: `npm run dev -- -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true },
});
