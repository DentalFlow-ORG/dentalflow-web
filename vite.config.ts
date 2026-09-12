import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test-utils/**",
        "src/tests/**",
        "src/**/*.d.ts",
      ],
      // Regression floors, not targets. They sit just under the measured
      // coverage so a change cannot quietly erode it, while leaving room for
      // ordinary refactors that shift the denominator by a few statements.
      //
      // These are below 100% because the remaining uncovered surface is
      // concentrated in code jsdom cannot exercise honestly — WebGL/Three.js
      // scenes, GSAP and scroll-driven animation, MediaRecorder, getUserMedia
      // and canvas image decoding — plus a small set of defensive branches
      // that are unreachable by construction. Both sets are enumerated in
      // docs/quality/frontend-coverage-policy.md. Raise these floors when that
      // list shrinks; never lower them to make a run pass.
      thresholds: {
        statements: 96.2,
        branches: 96.3,
        functions: 96.7,
        lines: 96.7,
      },
    },
  },
})
