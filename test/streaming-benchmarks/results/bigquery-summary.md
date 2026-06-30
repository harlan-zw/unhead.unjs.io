# BigQuery Research Results

## Budget Used
~910 GB of 1 TB free tier (monthly). Hit quota on the final correlation query.
Remaining correlation query can run next month or with billing enabled.

## Data Collected (Feb 2026 crawl, desktop)

### 1. Framework Adoption (342k+ Next.js origins)

| Framework  | Origins  |
|-----------|---------|
| Next.js    | 342,445 |
| Angular    | 147,136 |
| Nuxt.js    | 108,744 |
| Astro      | 29,035  |
| Gatsby     | 14,913  |
| SvelteKit  | 11,105  |
| Remix      | 7,134   |
| Qwik       | 393     |

### 2. Title Changed After Render (streaming/CSR signal)

**Key finding**: Angular has 37.5% of sites where the title changes after JS execution — the highest by far. This indicates heavy client-side rendering and poor SSR head completeness.

| Framework  | % Title Changed | % Missing Raw Title | % Missing Raw Description |
|-----------|----------------|--------------------|-----------------------|
| Angular    | **37.5%**      | 13.1%              | **68.2%**             |
| SvelteKit  | 16.0%          | **17.2%**          | 35.2%                 |
| Gatsby     | 13.9%          | 15.6%              | 22.9%                 |
| Nuxt.js    | 10.5%          | 8.7%               | 27.4%                 |
| Next.js    | 9.6%           | 11.1%              | 20.9%                 |
| Astro      | 3.4%           | 2.6%               | 11.9%                 |
| Remix      | **2.8%**       | **2.7%**           | 26.4%                 |
| Qwik       | **2.0%**       | **1.0%**           | 15.5%                 |

**Interpretation for the article:**
- **Blockers win for SSR completeness**: Qwik (2%), Remix (2.8%), Astro (3.4%) have the lowest title-change rates — these are frameworks that block head rendering
- **Angular is the worst offender** at 37.5% — most Angular apps are SPAs with client-side title setting
- **SvelteKit's 17.2% missing raw title** confirms the "first-flush" problem from Gemini research: deferred data can't update `<svelte:head>`
- **Next.js at 9.6%** — streaming metadata (15.2+) may contribute but most Next.js sites still use blocking SSR

### 3. Framework CWV Comparison (CrUX Jan 2026)

% of page loads in "good" threshold (higher = better):

| Framework  | FCP Good | LCP Good | CLS Good | INP Good |
|-----------|---------|---------|---------|---------|
| Astro      | **44.9%** | **44.9%** | 50.1%   | **52.9%** |
| SvelteKit  | 42.3%   | 41.8%   | 50.8%   | 51.1%   |
| Angular    | 40.3%   | 37.4%   | **54.9%** | 51.7%   |
| Gatsby     | 39.6%   | 37.1%   | 44.8%   | 44.9%   |
| Next.js    | 38.2%   | 36.9%   | 46.5%   | 46.4%   |
| Nuxt.js    | 37.3%   | 36.4%   | 47.8%   | 47.6%   |
| Remix      | 33.6%   | 35.5%   | 46.9%   | 48.1%   |
| Qwik       | 30.1%   | 29.5%   | 35.5%   | 38.3%   |

**Interpretation:**
- Astro leads in FCP/LCP — its static-first, no-JS-by-default model pays off
- Qwik's poor showing is likely a sample size issue (270 origins) and/or selection bias (early adopters building complex apps)
- Angular has the best CLS (54.9%) — ironic given its poor SSR head completeness; this may reflect mature apps with stable layouts

### 4. Head Completeness in Sample Data (10k sites)

From the 10k sample, chunked vs non-chunked Next.js comparison:

| Metric | Next.js Non-Chunked (n=1546) | Next.js Chunked (n=45) |
|--------|-----|-----|
| Has title | 70.1% | 71.1% |
| Has description | 66.4% | 73.3% |
| Has og:image | 44.6% | 48.9% |
| Has canonical | 53.9% | 44.4% |
| Has JSON-LD | 19.5% | **6.7%** |
| Has stylesheet | 50.2% | 66.7% |

**Notable**: JSON-LD drops from 19.5% to 6.7% in chunked Next.js responses. This could indicate that structured data is being deferred in streaming apps. Small sample but worth investigating further.

## Queries Not Yet Run (quota exhausted)

### title_changed × CWV correlation
The key question: "Do sites where the title changes after render have worse CWV?"
This would prove (or disprove) that incomplete SSR head tags correlate with worse performance.

**Query cost**: ~557 GB. Can run next billing cycle or with on-demand billing.

## All Results Files

- `framework-cwv.json` — CrUX data by framework
- `title-changed-by-framework.json` — SSR head completeness by framework
- `bigquery-summary.md` — this file
