# Dependency and tooling audit

Snapshot 2026-09-20, using installed packages, Bun lockfiles, `bun audit` and `bun outdated` in each repository. These results age quickly; rerun before release. No package was installed/upgraded, no lockfile changed and no major migration was attempted.

| Repository | Advisory result | Meaning |
| --- | --- | --- |
| dentalflow-web | 84: 1 critical, 28 high, 48 moderate, 7 low; exit 1 | Includes build/test/CLI dependencies and runtime graph. Not 84 demonstrated browser exploits. |
| dentalflow-api | 70: 31 high, 34 moderate, 5 low; exit 1 | Includes CLI/dev dependencies as well as Express/Nest runtime transitives. |

## Security-sensitive / replace soon

Frontend: seroval through TanStack Router is reported critical. The advisory concerns untrusted `fromJSON` deserialization with plugins; the reviewed app is a client-rendered Vite SPA, not TanStack Start, and no application `fromJSON`/server-function path was found. This limits the demonstrated exposure but does not justify ignoring the vulnerable lockfile. The advisory identifies 1.5.3 as patched. Review a compatible router/transitive update with auth/routing regression tests. [Maintainer advisory](https://github.com/lxsmnsyc/seroval/security/advisories/GHSA-mv8w-475r-vwqw).

Vite dev-server/Windows-path and Vitest mocker advisories affect developer tooling; do not expose development servers to untrusted networks. jsdom/undici, shadcn/MCP/Hono/qs, Knip/smol-toml and build parser advisories require toolchain updates and input/exposure review, not a claim of production API compromise. fflate is also reachable through Three/Drei dependencies; assess actual archive-loading paths.

API: qs/body-parser arrive through Express and need runtime review. The app configures explicit valid body-size strings, which is relevant to the invalid-limit advisory but not proof against all parser advisories. Multer is a Nest platform transitive; no upload interceptor/multipart handler was found in application source. form-data appears through test tooling; Prisma dev/Hono/mysql2 and compiler/linter parsers largely concern tooling. Verify actual deployment packaging before concluding a vulnerable dependency is absent from the runtime image.

Patch reachable runtime parsers/router dependencies first, then development tools. Do not use blanket `bun update --latest`; review compatible changes, regenerate lockfile only with approval and rerun gates. CI currently records advisories without failing; release triage remains an explicit responsibility.

## Outdated versions and migration risk

| Family | Installed snapshot → compatible candidate from registry | Decision |
| --- | --- | --- |
| TanStack Router | 1.168.24 → 1.170.38 | Review soon with seroval resolution and navigation/auth tests. |
| React/React DOM | 19.2.4 → 19.3.0 | Coordinated update; not needed merely for feature count. |
| Three | 0.184.0 → latest 0.186.0 outside current range | Review rendering/types compatibility; avoid automatic minor jump for 0.x. |
| Motion | 12.40.0 → compatible 12.43.0; latest major 13 | Compatible patch review; major migration deferred. |
| Biome | 1.9.4; latest major 2 | Migration changes diagnostics/configuration; approval required. |
| Nest core/common/platform | 11.1.19 → compatible 11.2.5; latest major 12 | Stay on supported current architecture; review patch together. |
| Prisma client/adapter/runtime | 7.8.0 → 7.10.0 | Upgrade all coupled packages together; regenerate client and run real migration/integration gates. |
| pg | 8.20.0 → 8.23.0 | Review adapter concurrency warning; do not jump to pg 9 blindly. |
| Stripe | 22.0.2 → 22.6.2 | SDK/API shape and test-mode checkout/webhook QA required. |
| OpenAI | 6.37.0 → compatible 6.49.0; latest major 7 | No model/vendor changes from version availability alone. |
| Resend | 6.12.3 → 6.28.1 | Verify reset email behavior; provider delivery manual. |

“Outdated” does not mean “deprecated” or “unsafe”. Registry metadata was checked for all 85 installed direct dependency entries across both repositories, with no lookup failures. API development dependency ESLint 9.39.4 is marked deprecated/unsupported; the other 84 entries had no deprecation marker at review time. This is not a security guarantee. Review ESLint migration separately rather than automatically changing major versions. No blanket “all dependencies safe” finding is made.

## Unused/dead code

The API deadcode command passes. Frontend full Knip passes after registering the new documentation CLI in package scripts; it emits a nonblocking stale-ignore hint. Production-only Knip reports 24 exports and 5 types. Every reported value export has test/support consumers; four types also have test/support consumers. RoleFeatureAccess is the return contract of the tested getRoleFeatureAccess helper and is used within its declaring source. These are retained test seams/contracts, not deleted to make production-only analysis green. The command's nonzero result remains disclosed.

Classification: unused production entry exports with intentional tests/contracts, not unused dependencies established by the full scan. No source helper, package or public type was deleted. The docs generator uses the already installed TypeScript compiler; the local-link checker uses only filesystem/path primitives. Both are registered CLI entrypoints, not application bundle code.

Existing CI uses frozen Bun installs, type/lint/test/coverage/build checks, backend migration/integration/E2E and advisory dependency audit. Recommended: reviewed runtime-advisory release policy, critical cross-repo contract fixtures and one monitoring channel. Generated OpenAPI/client adoption, automated changelog/dependency PR tools and paid monitoring remain proposals; no extra maintenance dependency was added.

## Hardening disposition

Current per-advisory paths, exposure, fixed candidates and deferred upgrades are maintained in [dependency-advisories.md](../deployment/dependency-advisories.md). Validation and explicit Knip test-contract annotations are recorded in [production hardening](../deployment/production-hardening.md); historical audit counts are not current results.
