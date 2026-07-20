# Research: The `<meta charset>` 1024-Byte Rule

## 1. The 1024-Byte Rule: Browser Behavior
The "1024-byte rule" is a browser optimization and safety mechanism. Browsers must determine a document's character encoding (e.g., UTF-8) as early as possible to correctly map bytes to characters.

### What happens when `<meta charset>` is missing in the first 1024 bytes?
If a browser (specifically Chromium) does not find a charset declaration within the first 1024 bytes (and no HTTP header or BOM is present), it defaults to a platform-specific encoding (often `windows-1252` or `ISO-8859-1`) or uses a "sniffer" to guess.

If the parser later encounters a `<meta charset>` that contradicts its initial guess:
1. **The Re-parse (Double Parsing):** The browser stops parsing, discards the current DOM tree, and restarts the entire parsing process from byte 0 using the new encoding.
2. **Preload Scanner Disruption:** The browser's speculative "look-ahead" scanner (which finds scripts/CSS to download early) may have already fetched resources based on the wrong encoding, leading to potential cache misses or re-fetches.
3. **Execution Delay:** Any scripts already executed may be invalidated, though browsers try to avoid this by blocking execution until the charset is certain.

### Chromium Source Code References
The logic is handled within the Blink rendering engine's HTML parser.
- **`HTMLMetaCharsetParser`**: Scans the initial bytes of the stream specifically for charset declarations.
- **`LookAheadParser` (now part of `HTMLDocumentParser`)**: Implements the scanning window.
- **Threshold Constant**: In `third_party/blink/renderer/core/html/parser/html_meta_charset_parser.h`, the constant `kMaxBytesToScan` is defined as **1024**.
- **Ref**: `third_party/blink/renderer/core/html/parser/html_document_parser.cc` - See `CheckForMetaCharset`.

### Firefox and Safari Thresholds
- **Firefox (Gecko)**: Also adheres to the **1024-byte** limit. Gecko's charset sniffer (Chardet) stops looking after this point to avoid performance degradation.
- **Safari (WebKit)**: Historically used a smaller buffer (~512 bytes) but has aligned with the **1024-byte** WHATWG standard for compatibility.

## 2. HTML Spec Requirements
The WHATWG HTML Living Standard is explicit about the position and serialization of the charset declaration.

### Spec References
- **Section 4.2.5.5**: "The element containing the character encoding declaration must be serialized completely within the first 1024 bytes of the document." [WHATWG Spec](https://html.spec.whatwg.org/multipage/semantics.html#charset)
- **Precedence Rules**:
    1. **HTTP `Content-Type: text/html; charset=utf-8`**: Highest precedence. If present, the `<meta>` tag is ignored for encoding purposes.
    2. **BOM (Byte Order Mark)**: If the first bytes are a UTF-8 BOM (`EF BB BF`), it overrides everything else, including the HTTP header (in most modern implementations).
    3. **`<meta charset>`**: Only used if the above two are missing.

## 3. Performance Impact
The cost of a late charset is primarily a "Time to First Paint" penalty.

- **Measurable Cost**: A late charset can delay **FCP (First Contentful Paint)** by **100ms-500ms** on average sites, and significantly more on high-latency mobile connections where the "re-parse" requires waiting for the parser to catch up.
- **FOUC (Flash of Unstyled Content)**: If the browser renders a frame using the wrong encoding (e.g., rendering `&nbsp;` as special characters), and then re-parses, the user sees a jarring jump in text rendering.
- **Non-ASCII Content (CJK, Arabic)**: If charset is late, CJK characters may be misinterpreted as multiple single-byte characters. This can break the **Preload Scanner** if it encounters these characters inside `href` or `src` attributes, leading to failed resource discovery.

## 4. Common Causes of Late Charset
Modern web frameworks and CMS patterns frequently push the charset past the 1024-byte mark:
1. **Large Inline CSS**: Placing a `<style>` block with hundreds of lines of Tailwind or Critical CSS before the charset.
2. **Social Metadata**: Massive `<meta property="og:description">` or JSON-LD blocks placed before the charset.
3. **Server-Side Includes (SSI)**: A standard header template that includes a large analytics snippet or "cookie consent" script before the actual `<head>` tags.
4. **Framework SSR**: Some SSR engines (like older versions of certain React/Vue setups) might inject state (`window.__INITIAL_STATE__`) high up in the `<head>`.

## 5. HTTP Archive BigQuery

### BigQuery Query
This query identifies pages where the charset appears after the 1024-byte threshold.

```sql
SELECT
  r.url,
  REGEXP_INSTR(CAST(b.body AS BYTES), b'(?i)<meta[^>]+charset\\s*=') AS charset_byte_pos,
  p.framework,
  p.chrome_user_experience_report.avg_fcp AS fcp
FROM
  `httparchive.response_bodies.2024_09_01_desktop` AS b
JOIN
  `httparchive.all.requests` AS r ON b.requestid = r.requestid
JOIN
  `httparchive.all.pages` AS p ON r.pageid = p.pageid
WHERE
  r.is_main_document = true
  AND REGEXP_INSTR(CAST(b.body AS BYTES), b'(?i)<meta[^>]+charset\\s*=') > 1024
ORDER BY
  charset_byte_pos DESC
LIMIT 1000
```

*Note: Querying `response_bodies` is extremely expensive (multi-TB). It is recommended to use `TABLESAMPLE SYSTEM (0.1 PERCENT)` for general research.*

## 6. Prior Art
- **Harry Roberts**: His research into `<head>` ordering (the "Get Your `<head>` Straight" talk) popularized the performance impact of charset placement.
- **Capo.js (Rick Viscomi)**: Assigns a **Weight of 10** (highest priority) to the charset. This is because any change to the charset *invalidates everything* that follows it in the parser.
- **Web Almanac (2022/2024)**: Statistics show that ~3-5% of sites still fail the 1024-byte rule, often due to automated injection of marketing scripts at the top of the `<head>`.

---
**Summary**: The `<meta charset>` is the "foundation" of the document. If it is moved or delayed, the browser's initial work is speculative and potentially throwaway. For Unhead, ensuring the charset is the very first element in the `<head>` is the single most impactful "zero-cost" optimization possible.
