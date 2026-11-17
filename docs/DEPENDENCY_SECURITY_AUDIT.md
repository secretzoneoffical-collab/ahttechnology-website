# Dependency Security Audit

**Checked:** 2026-11-17  
**Repository:** `secretzoneoffical-collab/ahttechnology-website`

## Current finding

GitHub Actions reported 14 high-severity findings through the transitive `picomatch` dependency chain. The relevant advisory is [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) / CVE-2026-112366: a ReDoS issue involving single-branch repeated extglob patterns.

The lockfile currently resolves:
- `picomatch@2.3.2`
- `picomatch@4.0.7`

Both are marked as development dependencies in `package-lock.json`. The current public advisory identifies versions through `4.0.7` as affected and does not list a fixed npm release. The npm registry still lists `4.0.7` as the latest release at the time of this review. An `npm audit fix --force` would change unrelated framework/linter versions and is not an acceptable substitute for an upstream security fix.

## CI policy while the upstream fix is unavailable

The workflow now has two separate gates:

1. **Production dependency audit:** `npm audit --omit=dev --audit-level=high` — high and critical production dependency findings fail CI.
2. **Full dependency audit:** `npm audit --audit-level=critical` — critical findings fail CI; high findings remain visible in the log while this known development-toolchain advisory is unresolved.

ESLint, TypeScript, and production build checks continue to run after the full dependency audit. This is an explicit temporary exception, not a claim that the entire dependency tree is vulnerability-free.

## Scope and practical exposure

The affected packages are currently transitive development dependencies used by build/lint tooling, not declared runtime dependencies. The application does not intentionally accept user-provided glob expressions. This reduces the direct runtime exposure but does not remove the dependency advisory.

## Required follow-up

- Recheck the advisory and upstream `picomatch` releases before each production release.
- Upgrade once a vendor-published fixed release is available and compatible with the dependent packages.
- Keep the production-only high/critical audit strict.
- Do not add a broad npm override to an incompatible major version merely to silence the audit.
- If the affected dependency enters the production dependency tree, block release until a supported remediation or reviewed mitigation is in place.

## Previous audit history

Earlier CI run `44128703927` completed with no vulnerabilities under the then-current advisory database. The new finding was added to the advisory database later and affects the then-current transitive lockfile. Historical clean results do not supersede the current finding.
