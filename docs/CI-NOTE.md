# CI behavior

FlytheBG CI runs for pull requests targeting `main` and pushes to `main`. Superseded runs for the same PR/ref are cancelled automatically. Historical failed workflow runs may remain visible in GitHub Actions; the current production signal is the latest successful CI run for the commit being merged or deployed.
