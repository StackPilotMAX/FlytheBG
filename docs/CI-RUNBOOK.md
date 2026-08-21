# FlytheBG CI runbook

Production CI is intentionally limited to pull requests targeting `main` and pushes to `main`.

A red CI run should represent a real production-quality issue, such as a high-severity production dependency advisory, test failure, TypeScript error, or failed static production build. CI must not be disabled merely to make the Actions page appear green.

Historical failed runs can remain visible in GitHub Actions even after the underlying problem is fixed. The release decision should use the CI result for the exact commit being merged or deployed.
