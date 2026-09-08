# Project execution

Use the npm validation scripts. They preserve the command's exit code, save full
output in ignored `.logs/` files, and print one result line on success or a bounded
log tail on failure. Prefer `npm run --silent <script>` to suppress npm banners.
Do not pipe checks through `tail` or `grep` and accidentally mask their exit code.
Inspect the saved log before rerunning a failed command. Logs can contain sensitive
data; do not commit them or paste their contents wholesale.

Use focused tests during Red → Green. Run the relevant full checks before handoff;
report failures and unexecuted checks honestly. `npm run check` is the fail-fast
static/application/runner/skill-packaging gate; build, database and browser
checks are separate.
Use `npm run test:runner` when modifying command execution. Keep interactive dev
and watch commands interactive.
