# Research Report: Open Graph Tag Completeness & Framework Adoption

## 1. OG Tag Spec & Requirements
The Open Graph Protocol (OGP) defines a hierarchy of tags that dictate how content is parsed by social platforms.

### Required vs. Optional Tags
- **Required (The "Big Four"):** `og:title`, `og:type`, `og:image`, and `og:url`. These are mandatory for a valid OGP object.
- **Optional:** `og:description`, `og:site_name`, `og:locale`, and media-specific tags (`og:image:width`, `og:image:alt`).

### Minimum Sets per Platform (2025)
| Platform | Minimum Required Tags | Missing `og:image` Behavior |
| :--- | :--- | :--- |
| **Twitter/X** | `og:title`, `og:image`, `twitter:card` | Text-only card; dramatically lower CTR. |
| **Facebook** | `og:title`, `og:image`, `og:url`, `og:type` | Gray placeholder box or no image preview. |
| **LinkedIn** | `og:title`, `og:image`, `og:url` | Bare link or small generic icon. |
| **Slack** | `og:title`, `og:image` | No image preview; only text unfurl. |
| **Discord** | `og:title`, `og:image`, `og:description` | No image embed; only title/desc. |
| **iMessage** | `og:title`, `og:image` | No preview if image < 300px; plain URL. |

### Precedence: Twitter/X vs. OG
**Rule:** `twitter:*` tags always take priority.
- **Fallback:** If `twitter:title` is missing, X falls back to `og:title`. This applies to description and image as well.
- **The `twitter:card` Exception:** There is no OG fallback for `twitter:card`. If missing, X defaults to a "summary" (small image) card even if a large OG image is available.

## 2. Prior Art & Statistics
Based on Web Almanac 2024 and early 2025 data:
- **`og:image` Adoption:** ~48% on desktop. Over half of the web is missing the most critical tag for social engagement.
- **Overall OG Adoption:** ~59% (Desktop) to ~64% (Mobile).
- **Common Mistakes:**
    1. **Relative URLs:** Most crawlers require absolute URLs (e.g., `https://...`) for `og:image`.
    2. **Missing Dimensions:** Omitting `og:image:width/height` forces crawlers to download the image before rendering the preview, causing delays.
    3. **Invalid Ratios:** LinkedIn and FB prefer **1.91:1 (1200x630)**.

## 3. Framework OG APIs
Frameworks have moved toward structured "Metadata APIs" to solve the "broken head" problem.

| Framework | Primary API | OG Handling |
| :--- | :--- | :--- |
| **Next.js** | `generateMetadata()` | Explicit `openGraph` object; type-safe. |
| **Nuxt** | `useSeoMeta()` | Powered by **Unhead**; maps flat keys to OG properties. |
| **Remix** | `meta()` export | Returns an array of descriptors; manual property mapping. |
| **Astro** | Layout-based | Developers manually insert tags in `<head>`. |
| **SvelteKit** | `<svelte:head>` | Fully manual; relies on data passed from `load`. |
| **Angular** | `Meta` service | Procedural API (`addTag`); **requires SSR** for bot visibility. |

## 4. HTTP Archive BigQuery

### Query: OG Presence per Framework
```sql
SELECT
  tech.technology AS framework,
  COUNT(DISTINCT p.url) AS total_pages,
  COUNTIF(EXISTS(SELECT 1 FROM UNNEST(p.custom_metrics.almanac.meta_nodes) AS m WHERE m.property = 'og:image')) / COUNT(0) AS og_image_rate,
  COUNTIF(EXISTS(SELECT 1 FROM UNNEST(p.custom_metrics.almanac.meta_nodes) AS m WHERE m.property = 'og:title')) / COUNT(0) AS og_title_rate,
  COUNTIF(EXISTS(SELECT 1 FROM UNNEST(p.custom_metrics.almanac.meta_nodes) AS m WHERE m.name = 'twitter:card')) / COUNT(0) AS twitter_card_rate
FROM
  `httparchive.crawl.pages` p,
  UNNEST(p.technologies) AS tech
WHERE
  date = '2025-07-01'
  AND is_root_page = TRUE
  AND tech.category = 'Web Frameworks'
GROUP BY 1
ORDER BY total_pages DESC
```

## 5. Social Crawler Behavior
Social crawlers remain highly restrictive and technically "frozen" compared to modern browsers.

- **JS Execution:** **None.** (Exceptions: FB sandbox for security). Content must be in the raw HTML response.
- **Timeouts:** Aggressive. Slack (3s), FB/Twitter (3-5s), Discord (10s).
- **Redirects:** Follow 5-10 hops max.
- **User-Agents:** Use specific strings like `Twitterbot`, `facebookexternalhit`, `LinkedInBot`.
- **Size Limit:** FB cuts off metadata parsing after **1 MB** of HTML.

## 6. og:image Best Practices
- **Dimensions:** 1200 x 630 pixels (1.91:1 ratio).
- **Format:** Safest is **PNG/JPG**. While Discord and Slack support **WebP**, LinkedIn and older Facebook scrapers have inconsistent support. **AVIF** is not recommended for OG images in 2025.
- **Absolute URLs:** Must include `https://`.
- **Caching:** Social caches are "sticky" (7-30 days).
    - **Strategy:** Use versioned URLs (`og-image.png?v=2`).
    - **Purging:** Use the LinkedIn Post Inspector or Facebook Sharing Debugger to force a re-scrape.

### Flagged Uncertainties
- **Twitterbot 2026:** Behavior on X is shifting toward favoring "X Premium" features for certain rich media previews; regular `twitter:card` behavior may be de-prioritized.
- **AVIF Support:** While browsers support it, social scrapers are often 3-5 years behind in codec support. Experimental testing is needed per-platform.
