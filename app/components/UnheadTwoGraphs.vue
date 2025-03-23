<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<!-- Background -->
<rect width="800" height="500" fill="#f8fafc" rx="12" ry="12" />

<!-- Title -->
<text x="400" y="50" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="600" text-anchor="middle" fill="#0f172a">Unhead Performance Improvements</text>

<!-- Subtle Grid -->
<line x1="100" y1="400" x2="720" y2="400" stroke="#e2e8f0" stroke-width="1" />
<line x1="100" y1="325" x2="720" y2="325" stroke="#e2e8f0" stroke-width="1" />
<line x1="100" y1="250" x2="720" y2="250" stroke="#e2e8f0" stroke-width="1" />
<line x1="100" y1="175" x2="720" y2="175" stroke="#e2e8f0" stroke-width="1" />
<line x1="100" y1="100" x2="720" y2="100" stroke="#e2e8f0" stroke-width="1" />

<!-- Y-axis -->
<line x1="100" y1="100" x2="100" y2="400" stroke="#cbd5e1" stroke-width="1" />
<text x="95" y="400" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end" fill="#64748b">0</text>
<text x="95" y="325" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end" fill="#64748b">0.1ms</text>
<text x="95" y="250" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end" fill="#64748b">0.2ms</text>
<text x="95" y="175" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end" fill="#64748b">0.3ms</text>
<text x="95" y="100" font-family="Inter, system-ui, sans-serif" font-size="11" text-anchor="end" fill="#64748b">0.4ms</text>

<!-- X-axis -->
<line x1="100" y1="400" x2="720" y2="400" stroke="#cbd5e1" stroke-width="1" />

<!-- Section 1: Rewritten Core -->
<g transform="translate(180, 0)">
  <!-- Connecting line -->
  <line x1="20" y1="165" x2="70" y2="280" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Before/After Bars -->
  <rect x="0" y="165" width="40" height="235" fill="#f87171" rx="6" opacity="0.9" />
  <rect x="50" y="280" width="40" height="120" fill="#2dd4bf" rx="6" opacity="0.9" />

  <!-- Labels -->
  <text x="20" y="155" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">0.34ms</text>
  <text x="70" y="270" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">0.20ms</text>

  <!-- Improvement Badge -->
  <rect x="25" y="180" width="40" height="22" rx="11" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
  <text x="45" y="195" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="#16a34a">+51%</text>

  <!-- Category Label -->
  <text x="45" y="425" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#0f172a">SSR Time</text>
  <text x="45" y="445" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Medium Site</text>
</g>

<!-- Section 2: Faster INP -->
<g transform="translate(340, 0)">
  <!-- Connecting line -->
  <line x1="20" y1="143" x2="70" y2="280" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Before/After Bars -->
  <rect x="0" y="143" width="40" height="257" fill="#f87171" rx="6" opacity="0.9" />
  <rect x="50" y="280" width="40" height="120" fill="#2dd4bf" rx="6" opacity="0.9" />

  <!-- Labels -->
  <text x="20" y="133" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">0.43ms</text>
  <text x="70" y="270" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">0.22ms</text>

  <!-- Improvement Badge -->
  <rect x="25" y="180" width="40" height="22" rx="11" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
  <text x="45" y="195" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="#16a34a">+64%</text>

  <!-- Category Label -->
  <text x="45" y="425" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#0f172a">Page Changes</text>
  <text x="45" y="445" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">10x useHead()</text>
</g>

<!-- Section 3: Client Bundle Size -->
<g transform="translate(500, 0)">
  <!-- Connecting line -->
  <line x1="20" y1="220" x2="70" y2="280" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Before/After Bars -->
  <rect x="0" y="220" width="40" height="180" fill="#f87171" rx="6" opacity="0.9" />
  <rect x="50" y="280" width="40" height="120" fill="#2dd4bf" rx="6" opacity="0.9" />

  <!-- Labels -->
  <text x="20" y="210" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">13.6kB</text>
  <text x="70" y="270" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">10.7kB</text>

  <!-- Improvement Badge -->
  <rect x="25" y="235" width="40" height="22" rx="11" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
  <text x="45" y="250" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="#16a34a">-21%</text>

  <!-- Category Label -->
  <text x="45" y="425" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#0f172a">Client Size</text>
  <text x="45" y="445" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Minimal Build</text>
</g>

<!-- Section 4: Server Bundle Size -->
<g transform="translate(660, 0)">
  <!-- Connecting line -->
  <line x1="20" y1="250" x2="70" y2="280" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Before/After Bars -->
  <rect x="0" y="250" width="40" height="150" fill="#f87171" rx="6" opacity="0.9" />
  <rect x="50" y="280" width="40" height="120" fill="#2dd4bf" rx="6" opacity="0.9" />

  <!-- Labels -->
  <text x="20" y="240" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">10.3kB</text>
  <text x="70" y="270" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" font-weight="500" fill="#0f172a">8.0kB</text>

  <!-- Improvement Badge -->
  <rect x="25" y="260" width="40" height="22" rx="11" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
  <text x="45" y="275" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="#16a34a">-22%</text>

  <!-- Category Label -->
  <text x="45" y="425" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" fill="#0f172a">Server Size</text>
  <text x="45" y="445" font-family="Inter, system-ui, sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Minimal Build</text>
</g>

<!-- Modern Legend -->
<rect x="275" y="465" width="250" height="26" rx="13" fill="#f1f5f9" />
<rect x="285" y="470" width="16" height="16" rx="3" fill="#f87171" />
<text x="310" y="483" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#334155">Before</text>

<rect x="375" y="470" width="16" height="16" rx="3" fill="#2dd4bf" />
<text x="400" y="483" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#334155">After</text>
</svg>
