-- A3: Head Completeness in Streamed vs Non-Streamed Responses
-- Checks first 5000 chars (approx <head> section) for critical SEO tags
-- Compares streaming vs non-streaming sites

SELECT
  -- Streaming classification
  CASE
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'<!--\$\??-->|<template id="B:|window\.__unhead__|_\$HY') THEN TRUE
    ELSE FALSE
  END AS is_streaming,
  detected_framework,
  COUNT(*) AS total_pages,
  -- Head completeness checks (first 5000 chars ≈ <head> section)
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<title[^>]*>')) / COUNT(*) AS pct_with_title,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<meta[^>]*charset')) / COUNT(*) AS pct_with_charset,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<meta[^>]*name=["\']description["\']')) / COUNT(*) AS pct_with_description,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<meta[^>]*property=["\']og:title["\']')) / COUNT(*) AS pct_with_og_title,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<meta[^>]*property=["\']og:image["\']')) / COUNT(*) AS pct_with_og_image,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<link[^>]*rel=["\']canonical["\']')) / COUNT(*) AS pct_with_canonical,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'<link[^>]*rel=["\']stylesheet["\']')) / COUNT(*) AS pct_with_stylesheet,
  COUNTIF(REGEXP_CONTAINS(SUBSTR(response_body, 1, 5000), r'application/ld\+json')) / COUNT(*) AS pct_with_jsonld
FROM (
  SELECT
    response_body,
    CASE
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'<!--\$\??-->|__next') THEN 'React/Next.js'
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'window\.__unhead__|__NUXT') THEN 'Nuxt/Unhead'
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'_\$HY') THEN 'Solid'
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'data-sveltekit') THEN 'SvelteKit'
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'ng-version=') THEN 'Angular'
      WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'data-qwik') THEN 'Qwik'
      ELSE 'Other'
    END AS detected_framework
  FROM
    `httparchive.sample_data.requests_10k`
  WHERE
    date = '2025-01-01'
    AND client = 'desktop'
    AND is_main_document = true
    AND response_body IS NOT NULL
    AND LENGTH(response_body) > 100
)
GROUP BY
  is_streaming,
  detected_framework
HAVING total_pages > 5
ORDER BY
  is_streaming DESC,
  total_pages DESC
