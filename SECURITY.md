# Security policy

## Supported version

Only the current production deployment and the `main` branch receive security fixes.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository instead of a public issue.
If you do not use GitHub, email <anustup.nayak@gmail.com> with `SECURITY` in the subject.
Include reproduction steps, affected URL or API route, likely impact, and any safe proof of
concept. Do not access data beyond what is needed to demonstrate the issue and do not publish
credentials or personal information.

Expect an acknowledgement within seven days. This is a personal, unfunded project: there is no
bug-bounty programme and no paid reward.

This application is a public, read-only data explorer and should never request user accounts,
payments, uploads, or sensitive personal data. Report any behaviour that contradicts that model.

## Dependency advisories

The release gate runs `npm audit --omit=dev --audit-level=high`, which reports **0 vulnerabilities**
for shipped code. A plain `npm audit` also reports development-only advisories that all resolve to
one transitive package (`brace-expansion`, GHSA-mh99-v99m-4gvg) reached through the ESLint
toolchain. That code runs only on a contributor's machine, never in the deployed application, and
the published fix requires a breaking ESLint major upgrade. It is tracked rather than shipped; an
override was tested and rejected because it breaks ESLint's config loader.
