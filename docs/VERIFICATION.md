# Verification — 2026-10-21

- Imported from the current hosted Site source commit `2c74adb5f707546cbe5f60f0bba2597edf532652`.
- Site entry point and relative assets are retained under `site/`; no Sites hosting identity, Git credentials or private deployment metadata is included.
- Local portfolio links, resource paths, notebook anchors and guided synthetic-case identifiers were checked during the source release.
- JavaScript and inline scripts pass syntax checks in the GitHub-ready copy.
- A bounded candidate-file credential-pattern scan runs before commit. The WAV asset is larger than the scanner's 2 MiB text limit and is reported separately.
- The résumé and recruitment contact details are intentionally present as part of the requested portfolio.

Run `python scripts/audit_repository.py` to repeat the candidate-file scan. Creating this repository does not deploy GitHub Pages or migrate the current hosted website.

Browser visual QA and real external-service end-to-end testing remain outstanding. Hosted synthetic project samples do not authorize real accounts, persist server decisions or send email. The new repository stays private pending review of public-sharing scope and asset notices.
