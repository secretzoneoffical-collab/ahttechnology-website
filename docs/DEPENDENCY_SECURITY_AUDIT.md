# Dependency Security Audit

**Checked:** 2026-11-17
**Repository:** `secretzoneoffical-collab/ahttechnology-website`

## Finding and remediation

The previous dependency manifest pinned Next.js `16.3.4` and `eslint-config-next` `16.3.4`. Published advisories identified critical and high-severity issues affecting the Next.js 16.3 release line, with fixes available in later 16.4 releases.

Updated and committed:
- `next`: `16.4.6`
- `eslint-config-next`: `16.4.6`
- Added and committed `package-lock.json` (lockfile version 3).
- CI now installs with `npm ci`, then runs `npm audit --audit-level=high`, ESLint, TypeScript, and production build.

## Verification

The GitHub Actions run [44128703927](https://github.com/secretzoneoffical-collab/ahttechnology-website/actions/runs/44128703927) completed successfully:
- Locked dependency install: success
- Audit threshold (high and critical): success
- ESLint: success
- TypeScript: success
- Next.js production build: success

The audit step is configured to fail on high or critical advisories. This result does not claim that no low- or moderate-severity advisories exist.

## Ongoing maintenance

- Keep `package-lock.json` committed and use `npm ci` for repeatable CI installs.
- Review Dependabot/npm audit alerts regularly.
- Update Next.js and `eslint-config-next` together, then rerun the complete CI pipeline.
- Do not deploy a version that fails the high/critical audit threshold.
