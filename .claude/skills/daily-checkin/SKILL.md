---
name: daily-checkin
description: Read Unhead documentation health and Sentry evidence in one daily check-in.
---

# Daily Check-in

Load the private token before running the shared CLI:

```sh
set -a
. "$HOME/.config/harlan-checkin/unhead.unjs.io.env"
set +a
export DAILY_CHECKIN_DIR="${DAILY_CHECKIN_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/daily-checkin/harlan-zw/unhead.unjs.io}"
mkdir -p "$DAILY_CHECKIN_DIR"
collector_exit=0
pnpm checkin > "$DAILY_CHECKIN_DIR/collector.log" 2>&1 || collector_exit=$?
cat "$DAILY_CHECKIN_DIR/collector.log"
printf 'Collector exit: %s\n' "$collector_exit"
```

Preserve an existing `DAILY_CHECKIN_DIR`. It keeps reports and `state.json` outside disposable worktrees.
Complete reports advance the daily baseline, including warnings and failures.
Same-day reruns preserve the first complete baseline. Incomplete reports never advance it.

Run from the repository root. Never print or commit the token.
Configure `CHECKIN_DEPLOYMENT`, `SENTRY_ORG=harlan-zw`, and `SENTRY_AUTH_TOKEN` externally.
The token authorizes only the read-only report. Keep existing admin authentication for admin operations.
Match the expected deployment to the active Pages build commit.
The script combines authenticated documentation checks and complete unresolved Sentry pagination.
The report requires both supported documentation versions and the AI Ready database.
Missing credentials, missing checks, stale reports, and wrong deployments remain unavailable.
Read severity and coverage together. Incomplete coverage never proves health.
Exit code 0 means complete passing evidence. Exit code 1 means complete warnings or failures.
Exit code 2 means incomplete coverage.

Use existing documentation routes to confirm rendering after a collection failure.
Check Pages deployment and content synchronization before changing documentation sources.
Keep local documentation previews separate from production evidence.
Use the installed Sentry check-in triage skill for issue details and verified repairs.
Inspect release, URL, browser, affected users, and recurrence before classifying issues.
Expected stale-documentation 404s and local preview errors follow existing Sentry policy.
Do not resolve issues until the deployed repair is verified.
No system-health email exists. Do not create one or send test messages.
Never deploy, mutate production data, or send messages without existing authorization.

The combined daily routine preserves 06:40 Australia/Sydney from the former Sentry schedule.
It activates only after package release, deployment, and draft merge.
No separate Sentry schedule remains.

The module discovers external checks in `checks/external` during preparation.
Keep required external IDs in `shared/checkin-external.ts`.
