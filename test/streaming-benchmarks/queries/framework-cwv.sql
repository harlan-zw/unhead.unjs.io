-- Framework CWV Comparison (Production Query)
-- Cost: ~15 GB (well within 1TB free tier)
-- Joins HTTP Archive framework detection (wappalyzer) with CrUX origin-level data

WITH framework_sites AS (
  SELECT DISTINCT
    CONCAT('https://', NET.HOST(page)) AS origin,
    t.technology
  FROM `httparchive.crawl.pages` p,
  UNNEST(p.technologies) t
  WHERE p.date = '2026-02-01'
    AND p.client = 'desktop'
    AND p.is_root_page = true
    AND t.technology IN ('Next.js', 'Nuxt.js', 'SvelteKit', 'Remix', 'Angular', 'Gatsby', 'Qwik', 'Astro')
),

crux AS (
  SELECT
    origin,
    -- Extract p75 values from CrUX histograms
    -- FCP
    first_contentful_paint.histogram AS fcp_hist,
    -- LCP
    largest_contentful_paint.histogram AS lcp_hist,
    -- CLS
    layout_instability.cumulative_layout_shift.histogram AS cls_hist,
    -- INP
    interaction_to_next_paint.histogram AS inp_hist
  FROM `chrome-ux-report.all.202601`
  WHERE form_factor.name = 'desktop'
)

SELECT
  fs.technology,
  COUNT(DISTINCT fs.origin) AS origins_with_crux,
  -- FCP: % good (< 1800ms), % poor (> 3000ms)
  ROUND(AVG(fcp_hist[OFFSET(0)].density), 3) AS fcp_good_pct,
  ROUND(AVG(fcp_hist[OFFSET(2)].density), 3) AS fcp_poor_pct,
  -- LCP: % good (< 2500ms), % poor (> 4000ms)
  ROUND(AVG(lcp_hist[OFFSET(0)].density), 3) AS lcp_good_pct,
  ROUND(AVG(lcp_hist[OFFSET(2)].density), 3) AS lcp_poor_pct,
  -- CLS: % good (< 0.1), % poor (> 0.25)
  ROUND(AVG(cls_hist[OFFSET(0)].density), 3) AS cls_good_pct,
  ROUND(AVG(cls_hist[OFFSET(2)].density), 3) AS cls_poor_pct,
  -- INP: % good (< 200ms), % poor (> 500ms)
  ROUND(AVG(inp_hist[OFFSET(0)].density), 3) AS inp_good_pct,
  ROUND(AVG(inp_hist[OFFSET(2)].density), 3) AS inp_poor_pct
FROM framework_sites fs
JOIN crux c ON fs.origin = c.origin
GROUP BY fs.technology
ORDER BY origins_with_crux DESC
