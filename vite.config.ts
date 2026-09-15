import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Tests run in UTC, never the developer's zone. Brazil-facing formatting is
// asserted against America/Sao_Paulo explicitly, so on a Sao_Paulo machine an
// implementation that forgot to set a timeZone would still produce the right
// answer and the test would pass for the wrong reason. Pinning UTC makes that
// class of bug fail. Production behaviour is unaffected: this only sets the
// timezone of the test process.
process.env.TZ = "UTC"

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
    // The default 5s is enough per test in isolation, but not under v8
    // coverage instrumentation with the full suite in flight — a handful of
    // fake-timer/user-event suites then exceed it and fail for load rather
    // than for behavior. This is headroom, not a slower expectation.
    testTimeout: 20_000,
    hookTimeout: 20_000,
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
        statements: 96.5,
        branches: 97.0,
        functions: 97.1,
        lines: 96.9,
      },
    },
  },
})
