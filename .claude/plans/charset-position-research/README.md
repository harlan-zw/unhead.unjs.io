# Charset Position Research Plan

Original research: **"The 1024-Byte Rule: How Many Sites Break Chrome's Charset Detection"**

Chrome looks for `<meta charset>` in the first 1024 bytes of HTML. If it doesn't find one, it buffers content and may re-encode the entire document when charset is eventually discovered. This causes a visible re-render on pages with non-ASCII content.

## Target: Section or callout in State of Head 2026

Small but punchy finding. Likely a callout box or short section rather than a full research pillar.

## Research Questions

1. What percentage of origins have `<meta charset>` beyond the first 1024 bytes?
2. Per-framework rates — which frameworks push charset down?
3. Common cause: large inline `<script>` or `<style>` blocks before charset?
4. Does this correlate with FCP (the re-encoding causes a parse restart)?

## BigQuery Approach

```sql
-- Position of charset declaration in response body
SELECT
  tech,
  COUNTIF(charset_position > 1024) / COUNT(*) as late_charset_rate,
  APPROX_QUANTILES(charset_position, 100)[OFFSET(50)] as median_charset_position
FROM (
  SELECT
    tech,
    STRPOS(body, 'charset') as charset_position
  FROM ...
)
```

## Unhead Angle

Unhead places `<meta charset>` at weight 10 (highest priority in Capo.js ordering) — it's always the first tag in `<head>`. This is automatic and not configurable, because there's no valid reason to put charset anywhere else.

## Key Hypotheses

1. 2-5% of origins have charset beyond 1024 bytes
2. WordPress sites with large inline CSS have the highest rate
3. Framework-rendered sites (Next.js, Nuxt, Remix) almost never have this problem — their templates put charset first
4. The FCP correlation will be small but measurable on affected pages
