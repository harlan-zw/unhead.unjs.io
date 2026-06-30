-- A1: Streaming Detection Query
-- Detects sites using streaming SSR via response headers + HTML markers
-- Table: httparchive.crawl.requests (has response_body + response_headers)
-- Cost control: only scans main documents, date-partitioned, limited columns

-- Use sample_data.requests_10k for free testing, crawl.requests for production
-- Replace TABLE_NAME below:
--   Free test: `httparchive.sample_data.requests_10k`
--   Production: `httparchive.crawl.requests`

SELECT
  page,
  url,
  -- Transfer-Encoding detection (HTTP/1.1 only)
  EXISTS(
    SELECT 1 FROM UNNEST(response_headers) h
    WHERE LOWER(h.name) = 'transfer-encoding'
    AND LOWER(h.value) LIKE '%chunked%'
  ) AS has_chunked_te,
  -- No Content-Length = possible H2/H3 streaming
  NOT EXISTS(
    SELECT 1 FROM UNNEST(response_headers) h
    WHERE LOWER(h.name) = 'content-length'
  ) AS missing_content_length,
  -- Framework streaming markers in response body
  REGEXP_CONTAINS(COALESCE(response_body, ''), r'<!--\$\??-->') AS has_react_suspense,
  REGEXP_CONTAINS(COALESCE(response_body, ''), r'<template id="B:') AS has_react_flush,
  REGEXP_CONTAINS(COALESCE(response_body, ''), r'window\.__unhead__') AS has_unhead_stream,
  REGEXP_CONTAINS(COALESCE(response_body, ''), r'_\$HY') AS has_solid_hydration,
  -- Framework detection
  CASE
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'<!--\$\??-->|__next') THEN 'React/Next.js'
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'window\.__unhead__|__NUXT') THEN 'Nuxt/Unhead'
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'_\$HY') THEN 'Solid'
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'data-sveltekit') THEN 'SvelteKit'
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'ng-version=') THEN 'Angular'
    WHEN REGEXP_CONTAINS(COALESCE(response_body, ''), r'data-qwik') THEN 'Qwik'
    ELSE 'Other'
  END AS detected_framework,
  -- Combined streaming signal
  (
    EXISTS(
      SELECT 1 FROM UNNEST(response_headers) h
      WHERE LOWER(h.name) = 'transfer-encoding'
      AND LOWER(h.value) LIKE '%chunked%'
    )
    AND REGEXP_CONTAINS(COALESCE(response_body, ''), r'<!--\$\??-->|<template id="B:|window\.__unhead__|_\$HY')
  ) AS is_likely_streaming
FROM
  `httparchive.sample_data.requests_10k`
WHERE
  date = '2025-01-01'
  AND client = 'desktop'
  AND is_main_document = true
  AND response_body IS NOT NULL
  AND LENGTH(response_body) > 100
