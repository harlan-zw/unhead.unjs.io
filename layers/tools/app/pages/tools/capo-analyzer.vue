<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { track, trackUse } = useToolTracking('capo-analyzer')

const codeOutputRef = ref<HTMLElement | null>(null)
useIntersectionObserver(codeOutputRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    trackUse()
  }
}, { threshold: 0.5 })

useSeoMeta({
  title: 'Capo.js Head Analyzer - Check Your HTML Head Tag Order',
  description: 'Analyze your HTML head tag order for optimal page load performance. Get a Capo.js score, see ordering issues, and generate optimized useHead() code.',
  ogTitle: 'Capo.js Head Analyzer | Unhead',
  ogDescription: 'Paste HTML or enter a URL to analyze head tag ordering. Get a score and specific fix suggestions based on Capo.js rules.',
})

const {
  input,
  url,
  framework,
  loading,
  error,
  analyzedTags,
  optimalTags,
  score,
  issues,
  hasAnyValue,
  generatedCode,
  codeLanguage,
  fetchUrl,
  reset,
} = useCapoAnalyzer()

const docsNav = useDocsNav()
const { selectedFramework } = useFrameworkSelector(docsNav)
watch(selectedFramework, (fw) => {
  if (fw?.slug)
    framework.value = fw.slug
}, { immediate: true })

const { copy, copied } = useClipboard()

const inputTab = ref('paste')

const scoreColor = computed(() => {
  if (score.value >= 80)
    return 'text-green-500'
  if (score.value >= 50)
    return 'text-yellow-500'
  return 'text-red-500'
})

const scoreRingColor = computed(() => {
  if (score.value >= 80)
    return 'stroke-green-500'
  if (score.value >= 50)
    return 'stroke-yellow-500'
  return 'stroke-red-500'
})

const scoreRingBg = computed(() => {
  if (score.value >= 80)
    return 'stroke-green-500/10'
  if (score.value >= 50)
    return 'stroke-yellow-500/10'
  return 'stroke-red-500/10'
})

const scoreBg = computed(() => {
  if (score.value >= 80)
    return 'from-green-500/10 to-emerald-500/5'
  if (score.value >= 50)
    return 'from-yellow-500/10 to-amber-500/5'
  return 'from-red-500/10 to-orange-500/5'
})

const scoreLabel = computed(() => {
  if (score.value >= 90)
    return 'Excellent'
  if (score.value >= 80)
    return 'Great'
  if (score.value >= 50)
    return 'Needs work'
  return 'Poor'
})

// Compute position deltas for each tag
const tagDeltas = computed(() => {
  return analyzedTags.value.map((tag, currentIdx) => {
    const optimalIdx = optimalTags.value.indexOf(tag)
    return optimalIdx - currentIdx // positive = needs to move down, negative = needs to move up
  })
})

// Priority groups: critical (dark), important (medium), low (light)
const weightColorMap: Record<string, string> = {
  'Content-Security-Policy': 'bg-[var(--ui-text-highlighted)]',
  'Charset': 'bg-[var(--ui-text-highlighted)]',
  'Viewport': 'bg-[var(--ui-text-highlighted)]',
  'Base': 'bg-[var(--ui-text)]',
  'Title': 'bg-[var(--ui-text)]',
  'Preconnect': 'bg-[var(--ui-text)]',
  'Async Script': 'bg-[var(--ui-text-muted)]',
  'Style @import': 'bg-[var(--ui-text-muted)]',
  'Sync Script': 'bg-[var(--ui-text-muted)]',
  'Stylesheet': 'bg-[var(--ui-text-muted)]',
  'Preload': 'bg-[var(--ui-text-dimmed)]',
  'Deferred Script': 'bg-[var(--ui-text-dimmed)]',
  'Prefetch/DNS': 'bg-[var(--ui-text-dimmed)]',
  'Other': 'bg-[var(--ui-text-dimmed)]',
}

const sampleHead = [
  '<head>',
  '  <title>My Website<\/title>',
  '  <script src="/app.js"><\/script>',
  '  <link rel="stylesheet" href="/style.css">',
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  '  <link rel="preconnect" href="https://fonts.googleapis.com">',
  '  <meta name="description" content="A sample website">',
  '  <link rel="preload" href="/font.woff2" as="font" crossorigin>',
  '  <script defer src="/analytics.js"><\/script>',
  '<\/head>',
].join('\n')

function loadSample() {
  input.value = sampleHead
  track('preset', 'sample')
}

function handleAnalyzeUrl() {
  if (url.value) {
    fetchUrl()
    track('use', 'url')
  }
}

function formatTagPreview(tag: { tag: string, attributes: Record<string, string> }): string {
  if (tag.tag === 'meta') {
    if (tag.attributes.charset)
      return `<meta charset="${tag.attributes.charset}">`
    if (tag.attributes.name)
      return `<meta name="${tag.attributes.name}">`
    if (tag.attributes['http-equiv'])
      return `<meta http-equiv="${tag.attributes['http-equiv']}">`
    if (tag.attributes.property)
      return `<meta property="${tag.attributes.property}">`
  }
  if (tag.tag === 'link') {
    const href = tag.attributes.href
    const short = href ? `/${href.split('/').pop()}` : ''
    return `<link rel="${tag.attributes.rel || '?'}"${short ? ` href="...${short}"` : ''}>`
  }
  if (tag.tag === 'script' && tag.attributes.src) {
    const src = `/${tag.attributes.src.split('/').pop()}`
    return `<script src="...${src}">`
  }
  if (tag.tag === 'title')
    return '<title>'
  if (tag.tag === 'base')
    return '<base>'
  return `<${tag.tag}>`
}
</script>

<template>
  <ToolPageLayout>
    <ToolHero
      title="Capo.js Head Analyzer"
      description="Analyze your HTML head tag order for optimal page load performance. Get a score, identify issues, and generate optimized code."
    />

    <!-- Input Section -->
    <div class="mb-12 max-w-6xl">
      <!-- Tab switcher -->
      <div class="flex items-center gap-4 mb-5">
        <div class="flex gap-1 p-1 rounded-lg bg-elevated border border-default">
          <button
            type="button"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
            :class="inputTab === 'paste'
              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-muted hover:text-default'"
            @click="inputTab = 'paste'"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-carbon-paste" class="size-3.5" />
              Paste HTML
            </span>
          </button>
          <button
            type="button"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
            :class="inputTab === 'url'
              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-muted hover:text-default'"
            @click="inputTab = 'url'"
          >
            <span class="flex items-center gap-2">
              <UIcon name="i-carbon-link" class="size-3.5" />
              Fetch URL
            </span>
          </button>
        </div>
        <button
          v-if="!hasAnyValue"
          type="button"
          class="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          @click="loadSample"
        >
          <UIcon name="i-carbon-play-filled" class="size-3" />
          Try sample
        </button>
        <div class="h-px flex-1 bg-[var(--ui-border)]" />
      </div>

      <!-- Paste mode -->
      <div v-if="inputTab === 'paste'">
        <ToolInputGlow>
          <div class="flex items-center gap-3 mb-4">
            <UIcon name="i-carbon-code" class="w-5 h-5 text-cyan-500" />
            <h3 class="text-sm font-medium text-muted uppercase tracking-wider">
              Paste your &lt;head&gt; HTML
            </h3>
          </div>
          <ToolCodeEditor
            v-model="input"
            lang="html"
          />
        </ToolInputGlow>
      </div>

      <!-- URL mode -->
      <div v-else>
        <ToolInputGlow>
          <div class="flex items-center gap-3 mb-4">
            <UIcon name="i-carbon-earth" class="w-5 h-5 text-cyan-500" />
            <h3 class="text-sm font-medium text-muted uppercase tracking-wider">
              Enter a URL to analyze
            </h3>
          </div>
          <div class="flex gap-3">
            <UInput
              v-model="url"
              placeholder="https://example.com"
              class="flex-1"
              size="lg"
              @keydown.enter="handleAnalyzeUrl"
            >
              <template #leading>
                <UIcon name="i-carbon-link" class="size-4 text-dimmed" />
              </template>
            </UInput>
            <UButton
              color="primary"
              size="lg"
              :loading="loading"
              :disabled="!url"
              icon="i-carbon-search"
              @click="handleAnalyzeUrl"
            >
              Analyze
            </UButton>
          </div>
          <p v-if="error" class="mt-3 text-sm text-[var(--ui-text-error)] flex items-center gap-2">
            <UIcon name="i-carbon-warning" class="size-4 shrink-0" />
            {{ error }}
          </p>
        </ToolInputGlow>
      </div>
    </div>

    <!-- Results Section -->
    <div
      v-if="hasAnyValue"
      class="max-w-6xl"
    >
      <!-- Score + Issues Grid -->
      <div class="grid lg:grid-cols-3 gap-6 mb-10">
        <!-- Score Card with Ring -->
        <div class="relative overflow-hidden rounded-2xl border border-default bg-elevated p-8">
          <div class="absolute inset-0 bg-gradient-to-br opacity-30" :class="scoreBg" />
          <div class="relative flex flex-col items-center">
            <!-- Score Ring -->
            <div class="relative w-36 h-36 mb-4">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <!-- Background ring -->
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke-width="6"
                  :class="scoreRingBg"
                />
                <!-- Score ring -->
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke-width="6"
                  stroke-linecap="round"
                  :class="scoreRingColor"
                  :stroke-dasharray="`${score * 2.64} 264`"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <!-- Score number -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-bold tabular-nums" :class="scoreColor">{{ score }}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider text-dimmed">/ 100</span>
              </div>
            </div>
            <div class="text-sm font-semibold" :class="scoreColor">
              {{ scoreLabel }}
            </div>
            <div class="mt-2 text-xs text-dimmed">
              {{ analyzedTags.length }} tags analyzed
            </div>
          </div>
        </div>

        <!-- Issues Panel -->
        <div class="lg:col-span-2 rounded-2xl border border-default bg-elevated p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-1.5 rounded-lg" :class="issues.length ? 'bg-yellow-500/10' : 'bg-green-500/10'">
              <UIcon
                :name="issues.length ? 'i-carbon-warning-alt' : 'i-carbon-checkmark-filled'"
                class="w-4 h-4"
                :class="issues.length ? 'text-yellow-500' : 'text-green-500'"
              />
            </div>
            <h3 class="text-sm font-semibold text-highlighted">
              {{ issues.length ? `${issues.length} ordering issue${issues.length > 1 ? 's' : ''} found` : 'Perfect order' }}
            </h3>
          </div>

          <div v-if="issues.length" class="space-y-2 max-h-[280px] overflow-y-auto pr-2 -mr-2">
            <div
              v-for="(issue, idx) in issues"
              :key="idx"
              class="flex items-start gap-3 p-3 rounded-xl transition-colors"
              :class="issue.severity === 'error'
                ? 'bg-red-500/5 border border-red-500/10 hover:bg-red-500/8'
                : 'bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/8'"
            >
              <UIcon
                :name="issue.severity === 'error' ? 'i-carbon-arrow-up' : 'i-carbon-arrow-up'"
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="issue.severity === 'error' ? 'text-red-500' : 'text-yellow-500'"
              />
              <span class="text-sm text-default">{{ issue.message }}</span>
            </div>
          </div>
          <div v-else class="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
            <UIcon name="i-carbon-checkmark-filled" class="w-5 h-5 text-green-500" />
            <span class="text-sm text-default">All tags are in optimal Capo.js order</span>
          </div>
        </div>
      </div>

      <!-- Tag List: Current vs Optimal -->
      <div class="grid lg:grid-cols-2 gap-6 mb-10">
        <!-- Current Order -->
        <div class="rounded-2xl border border-default bg-elevated overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-default">
            <div class="flex items-center gap-2">
              <UIcon name="i-carbon-list" class="w-4 h-4 text-muted" />
              <span class="text-xs font-semibold text-muted uppercase tracking-wider">Current Order</span>
            </div>
            <UBadge v-if="score < 100" variant="subtle" color="warning" size="xs">
              {{ issues.length }} to fix
            </UBadge>
          </div>
          <div class="divide-y divide-[var(--ui-border)]/50 max-h-[420px] overflow-y-auto">
            <div
              v-for="(tag, idx) in analyzedTags"
              :key="idx"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--ui-bg-accented)]/30 transition-colors group"
            >
              <span class="text-[11px] font-mono text-dimmed w-5 text-right tabular-nums">{{ idx + 1 }}</span>
              <span class="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/10" :class="weightColorMap[tag.weightLabel] || 'bg-gray-500'" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-default truncate">
                  {{ tag.weightLabel }}
                </div>
                <div class="text-[11px] font-mono text-dimmed truncate">
                  {{ formatTagPreview(tag) }}
                </div>
              </div>
              <!-- Position delta indicator -->
              <div v-if="tagDeltas[idx] !== 0" class="flex items-center gap-0.5 shrink-0">
                <UIcon
                  :name="tagDeltas[idx] < 0 ? 'i-carbon-arrow-up' : 'i-carbon-arrow-down'"
                  class="size-3"
                  :class="tagDeltas[idx] < 0 ? 'text-red-400' : 'text-green-400'"
                />
                <span class="text-[10px] font-mono tabular-nums" :class="tagDeltas[idx] < 0 ? 'text-red-400' : 'text-green-400'">
                  {{ Math.abs(tagDeltas[idx]) }}
                </span>
              </div>
              <UIcon v-else name="i-carbon-checkmark" class="size-3.5 text-green-500 shrink-0" />
            </div>
          </div>
        </div>

        <!-- Optimal Order -->
        <div class="rounded-2xl border border-cyan-500/20 bg-elevated overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-cyan-500/10 bg-gradient-to-r from-cyan-500/8 to-transparent">
            <div class="flex items-center gap-2">
              <UIcon name="i-carbon-checkmark-outline" class="w-4 h-4 text-cyan-500" />
              <span class="text-xs font-semibold text-muted uppercase tracking-wider">Optimal Order</span>
            </div>
            <UBadge variant="subtle" color="success" size="xs">
              Capo.js
            </UBadge>
          </div>
          <div class="divide-y divide-[var(--ui-border)]/50 max-h-[420px] overflow-y-auto">
            <div
              v-for="(tag, idx) in optimalTags"
              :key="idx"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-500/3 transition-colors group"
            >
              <span class="text-[11px] font-mono text-dimmed w-5 text-right tabular-nums">{{ idx + 1 }}</span>
              <span class="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/10" :class="weightColorMap[tag.weightLabel] || 'bg-gray-500'" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-default truncate">
                  {{ tag.weightLabel }}
                </div>
                <div class="text-[11px] font-mono text-dimmed truncate">
                  {{ formatTagPreview(tag) }}
                </div>
              </div>
              <span class="text-[10px] font-mono text-dimmed opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">w:{{ tag.weight }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Output -->
      <div
        ref="codeOutputRef"
        class="relative bg-elevated rounded-2xl border border-default overflow-hidden"
      >
        <!-- Terminal-style header -->
        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-default">
          <div class="flex items-center gap-2">
            <UIcon name="i-carbon-code" class="w-4 h-4 text-cyan-500" />
            <span class="text-xs font-medium text-muted uppercase tracking-wider">Optimized Code</span>
          </div>
          <ClientOnly>
            <UButton
              :icon="copied ? 'i-carbon-checkmark' : 'i-carbon-copy'"
              :color="copied ? 'success' : 'neutral'"
              variant="soft"
              size="xs"
              class="transition-all"
              @click="() => { copy(generatedCode); track('copy') }"
            >
              <span class="hidden sm:inline">{{ copied ? 'Copied!' : 'Copy' }}</span>
            </UButton>
          </ClientOnly>
        </div>

        <!-- Code content -->
        <div class="p-3 sm:p-5 space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <FrameworkSelectorMinimal size="small" ignore-redirect />
          </div>
          <div class="max-w-none [&_pre]:!my-0 [&_pre]:!rounded-lg sm:[&_pre]:!rounded-xl">
            <ToolCodeBlock :code="generatedCode" :lang="codeLanguage" />
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <UButton variant="ghost" color="neutral" size="sm" icon="i-carbon-reset" class="opacity-60 hover:opacity-100 transition-opacity" @click="() => { reset(); track('reset') }">
          Reset All
        </UButton>
      </div>
    </div>

    <!-- Educational Content -->
    <div class="max-w-4xl space-y-10 sm:space-y-16 mt-16 sm:mt-24">
      <div class="h-px bg-[var(--ui-border)]" />

      <section>
        <ToolSectionHeader title="Why Head Tag Order Matters" icon="i-carbon-lightning" color="cyan" />
        <p class="text-muted mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
          Browsers parse the <code class="text-sm bg-accented px-1.5 py-0.5 rounded font-mono">&lt;head&gt;</code> element top-to-bottom. Getting the order wrong can delay rendering, cause re-parsing, and hurt your Core Web Vitals.
        </p>
        <div class="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-default hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <UIcon name="i-carbon-flash" class="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <strong class="text-highlighted block mb-1">Faster LCP</strong>
                <span class="text-sm text-muted">Critical resources discovered and loaded sooner</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-default hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <UIcon name="i-carbon-renew" class="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <strong class="text-highlighted block mb-1">No Re-parsing</strong>
                <span class="text-sm text-muted">Charset and viewport before content avoids re-parsing</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-default hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <UIcon name="i-carbon-connection-signal" class="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <strong class="text-highlighted block mb-1">Effective Preconnects</strong>
                <span class="text-sm text-muted">Connection hints before the resources that need them</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-default hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <UIcon name="i-carbon-automatic" class="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <strong class="text-highlighted block mb-1">Automated by Unhead</strong>
                <span class="text-sm text-muted">Zero config — useHead() sorts tags automatically</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <ToolSectionHeader title="Learn More" icon="i-carbon-book" color="blue" />
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <NuxtLink to="/learn/what-is-capo" aria-label="What is Capo.js?" class="group">
            <UButton variant="soft" color="primary" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
              What is Capo.js?
            </UButton>
          </NuxtLink>
          <NuxtLink to="/docs/typescript/head/guides/get-started/overview" aria-label="Unhead Docs" class="group">
            <UButton variant="soft" color="neutral" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg transition-all">
              Unhead Docs
            </UButton>
          </NuxtLink>
          <UButton
            variant="soft"
            color="neutral"
            trailing-icon="i-carbon-launch"
            size="sm"
            as="a"
            href="https://github.com/rviscomi/capo.js"
            target="_blank"
            rel="noopener"
          >
            Capo.js on GitHub
          </UButton>
        </div>
      </section>

      <RelatedTools />

      <ToolFeedback tool-id="capo-analyzer" />
    </div>
  </ToolPageLayout>
</template>
