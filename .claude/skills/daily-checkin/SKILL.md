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
pnpm checkin
```

Run from the repository root. Never print or commit the token.
Configure `CHECKIN_DEPLOYMENT`, `SENTRY_ORG=harlan-zw`, and `SENTRY_AUTH_TOKEN` externally.
The token authorizes only the read-only report. Keep existing admin authentication for admin operations.
Match the expected deployment to the active Pages build commit.
The script combines authenticated documentation checks and complete unresolved Sentry pagination.
The report requires both supported documentation versions and the AI Ready database.
Missing credentials, missing checks, stale reports, and wrong deployments remain unavailable.
Read severity and coverage together. Incomplete coverage never proves health.
Exit codes are 0 for complete passing evidence, 1 for warning or incomplete, and 2 for failure.

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
