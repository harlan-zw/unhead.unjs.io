<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Motion } from 'motion-v'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

const { track, trackView } = useToolAnalytics('meta-tag-generator')
onMounted(trackView)

// Track "use" when code output scrolls into view
const codeOutputRef = ref<HTMLElement | null>(null)
const hasTrackedUse = ref(false)
useIntersectionObserver(codeOutputRef, ([{ isIntersecting }]) => {
  if (isIntersecting && !hasTrackedUse.value) {
    hasTrackedUse.value = true
    track('use')
  }
}, { threshold: 0.5 })

useSeoMeta({
  title: 'Meta Tag Generator - Generate useSeoMeta Code',
  description: 'Free meta tag generator for Vue, React, Nuxt, and more. Generate useSeoMeta() code with live SERP and social card preview.',
  ogTitle: 'Meta Tag Generator | Unhead',
  ogDescription: 'Generate SEO meta tags as useSeoMeta() composable code. Preview Google SERP and social cards.',
})

const {
  state,
  frameworks,
  presets,
  activePreset,
  hasAnyValue,
  titleLength,
  descriptionLength,
  titleWarning,
  descriptionWarning,
  generatedCode,
  codeLanguage,
  reset,
  applyPreset,
} = useMetaTagGenerator()

// Sync framework selector with code generator
const docsNav = useDocsNav()
const { selectedFramework } = useFrameworkSelector(docsNav)
watch(selectedFramework, (fw) => {
  if (fw?.slug)
    state.framework = fw.slug as typeof state.framework
}, { immediate: true })

const { copy, copied } = useClipboard()

const inputFocused = ref(false)
const activePlatform = ref('twitter')
const activeFormTab = ref('basic')

const outputModes = [
  { label: 'useSeoMeta', value: 'useSeoMeta' },
  { label: 'useHead', value: 'useHead' },
  { label: 'HTML', value: 'html' },
]

const ogTypes = [
  { label: 'Website', value: 'website' },
  { label: 'Article', value: 'article' },
  { label: 'Product', value: 'product' },
]

const twitterCards = [
  { label: 'Summary Large Image', value: 'summary_large_image' },
  { label: 'Summary', value: 'summary' },
]

const platformTabs = [
  { label: 'Twitter/X', value: 'twitter', icon: 'i-carbon-logo-x', color: 'text-neutral-100' },
  { label: 'Facebook', value: 'facebook', icon: 'i-carbon-logo-facebook', color: 'text-blue-400' },
  { label: 'LinkedIn', value: 'linkedin', icon: 'i-carbon-logo-linkedin', color: 'text-sky-400' },
  { label: 'WhatsApp', value: 'whatsapp', icon: 'i-carbon-chat', color: 'text-green-500' },
  { label: 'Slack', value: 'slack', icon: 'i-carbon-logo-slack', color: 'text-purple-400' },
  { label: 'Discord', value: 'discord', icon: 'i-carbon-logo-discord', color: 'text-indigo-400' },
]

function truncate(text: string, max: number): string {
  if (!text)
    return ''
  return text.length > max ? `${text.slice(0, max)}...` : text
}

function getHostname(url: string): string {
  if (!url)
    return 'example.com'
  return url.replace(/^https?:\/\//, '').split('/')[0]
}

const previewTitle = computed(() => state.ogTitle || state.title || 'Your Page Title')
const previewDescription = computed(() => state.ogDescription || state.description || 'Your page description will appear here.')
const previewUrl = computed(() => state.ogUrl || state.canonical || 'example.com')
const previewImage = computed(() => state.ogImage || '')
const previewSiteName = computed(() => state.ogSiteName || getHostname(previewUrl.value))

const codeLang = computed(() => codeLanguage.value === 'html' ? 'html' : 'ts')
</script>

<template>
  <ToolPageLayout color-scheme="amber">
    <ToolHero
      title="Meta Tag Generator"
      description="Generate useSeoMeta() code for Vue, React, Nuxt, and more. Preview how your page will look in search results and social shares."
      color-scheme="amber"
    />

    <!-- Quick Start Presets -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.4 }"
      class="mb-12 max-w-6xl"
    >
      <div class="flex items-center gap-4 mb-5">
        <span class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">Quick Start</span>
        <div class="h-px flex-1 bg-gradient-to-r from-[var(--ui-border)] to-transparent" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="group relative overflow-hidden rounded-xl border backdrop-blur-sm p-3 sm:p-4 text-left transition-all duration-300 cursor-pointer"
          :class="[
            activePreset === preset.id
              ? 'border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/50 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5',
          ]"
          @click="() => { applyPreset(preset); track('preset', preset.id) }"
        >
          <!-- Hover gradient -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 transition-opacity duration-300"
            :class="activePreset === preset.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          />

          <div class="relative">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div
                class="p-1.5 sm:p-2 rounded-lg transition-colors"
                :class="activePreset === preset.id ? 'bg-amber-500/20' : 'bg-amber-500/10 group-hover:bg-amber-500/20'"
              >
                <UIcon :name="preset.icon" class="size-3.5 sm:size-4 text-amber-500" />
              </div>
            </div>
            <span
              class="text-xs sm:text-sm font-semibold transition-colors"
              :class="activePreset === preset.id ? 'text-amber-500' : 'text-[var(--ui-text-highlighted)] group-hover:text-amber-500'"
            >{{ preset.label }}</span>
            <p class="text-[10px] sm:text-xs text-[var(--ui-text-dimmed)] mt-1 line-clamp-2">
              {{ preset.description }}
            </p>
          </div>
        </button>
      </div>
    </Motion>

    <!-- Basic Form + Google Preview -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.5 }"
      class="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl"
    >
      <!-- Left Column: Form -->
      <div>
        <ToolInputGlow :focused="inputFocused" color-scheme="amber">
          <!-- Form Tabs -->
          <div class="flex gap-1 mb-6 p-1.5 bg-[var(--ui-bg-accented)]/30 backdrop-blur-sm rounded-xl border border-[var(--ui-border)]/50 overflow-x-auto">
            <button
              v-for="tab in [
                { value: 'basic', label: 'Basic', icon: 'i-carbon-text-short-paragraph' },
                { value: 'opengraph', label: 'Open Graph', icon: 'i-carbon-share' },
                { value: 'article', label: 'Article', icon: 'i-carbon-blog', show: state.ogType === 'article' },
                { value: 'technical', label: 'Technical', icon: 'i-carbon-settings' },
              ].filter(t => t.show !== false)"
              :key="tab.value"
              class="relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 shrink-0"
              :class="[
                activeFormTab === tab.value
                  ? 'bg-[var(--ui-bg-elevated)] shadow-md text-[var(--ui-text-highlighted)]'
                  : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)]',
              ]"
              @click="activeFormTab = tab.value"
            >
              <UIcon
                :name="tab.icon"
                class="w-4 h-4 transition-colors duration-300 shrink-0"
                :class="activeFormTab === tab.value ? 'text-amber-500' : ''"
              />
              <span class="hidden sm:inline truncate">{{ tab.label }}</span>
              <!-- Active indicator dot -->
              <span
                v-if="activeFormTab === tab.value"
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
              />
            </button>
          </div>

          <!-- Basic Tab -->
          <div v-show="activeFormTab === 'basic'" class="space-y-4">
            <UFormField label="Title" :hint="`${titleLength}/60`">
              <UInput
                v-model="state.title"
                placeholder="My Awesome Page"
                size="lg"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
              <template v-if="titleWarning" #help>
                <span class="text-amber-500">{{ titleWarning }}</span>
              </template>
            </UFormField>

            <UFormField label="Description" :hint="`${descriptionLength}/160`">
              <UTextarea
                v-model="state.description"
                placeholder="A brief description of your page content..."
                :rows="3"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
              <template v-if="descriptionWarning" #help>
                <span class="text-amber-500">{{ descriptionWarning }}</span>
              </template>
            </UFormField>
          </div>

          <!-- Open Graph Tab -->
          <div v-show="activeFormTab === 'opengraph'" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Site Name">
                <UInput
                  v-model="state.ogSiteName"
                  placeholder="My Website"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Locale">
                <UInput
                  v-model="state.ogLocale"
                  placeholder="en_US"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>

            <UFormField label="OG Title" help="Leave empty to use page title">
              <UInput
                v-model="state.ogTitle"
                :placeholder="state.title || 'Uses page title'"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <UFormField label="OG Description" help="Leave empty to use page description">
              <UTextarea
                v-model="state.ogDescription"
                :placeholder="state.description || 'Uses page description'"
                :rows="2"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <UFormField label="OG Image URL">
              <UInput
                v-model="state.ogImage"
                placeholder="https://example.com/og-image.png"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
              <template #help>
                <span class="text-[var(--ui-text-dimmed)]">Recommended: 1200x630px</span>
              </template>
            </UFormField>

            <div class="grid grid-cols-3 gap-4">
              <UFormField label="Image Alt">
                <UInput
                  v-model="state.ogImageAlt"
                  placeholder="Image description"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Width">
                <UInput
                  v-model="state.ogImageWidth"
                  placeholder="1200"
                  type="number"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Height">
                <UInput
                  v-model="state.ogImageHeight"
                  placeholder="630"
                  type="number"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="OG Type">
                <USelect v-model="state.ogType" :items="ogTypes" value-key="value" class="w-full" />
              </UFormField>
              <UFormField label="OG URL">
                <UInput
                  v-model="state.ogUrl"
                  :placeholder="state.canonical || 'https://...'"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>
          </div>

          <!-- Article Tab (only visible when ogType is 'article') -->
          <div v-show="activeFormTab === 'article'" class="space-y-4">
            <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <div class="flex items-start gap-2">
                <UIcon name="i-carbon-information" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p class="text-xs text-[var(--ui-text-muted)]">
                  Article metadata helps search engines and social platforms understand your content better.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Published Date">
                <UInput
                  v-model="state.articlePublishedTime"
                  type="datetime-local"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Modified Date">
                <UInput
                  v-model="state.articleModifiedTime"
                  type="datetime-local"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>

            <UFormField label="Author" help="Author name or profile URL">
              <UInput
                v-model="state.articleAuthor"
                placeholder="John Doe or https://example.com/authors/john"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Section" help="Category or section name">
                <UInput
                  v-model="state.articleSection"
                  placeholder="Technology"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Tags" help="Comma-separated keywords">
                <UInput
                  v-model="state.articleTag"
                  placeholder="javascript, vue, nuxt"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>
          </div>

          <!-- Technical Tab -->
          <div v-show="activeFormTab === 'technical'" class="space-y-4">
            <UFormField label="Author" help="Page author name">
              <UInput
                v-model="state.author"
                placeholder="John Doe"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <UFormField label="Canonical URL">
              <UInput
                v-model="state.canonical"
                placeholder="https://example.com/canonical-page"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <UFormField label="Robots">
              <UInput
                v-model="state.robots"
                placeholder="index, follow"
                class="w-full"
                @focus="inputFocused = true"
                @blur="inputFocused = false"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Theme Color" help="Browser UI color">
                <UInput
                  v-model="state.themeColor"
                  placeholder="#ffffff"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Color Scheme">
                <USelect
                  v-model="state.colorScheme"
                  :items="[
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                    { label: 'Light & Dark', value: 'light dark' },
                  ]"
                  value-key="value"
                  placeholder="None"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="App Name" help="PWA application name">
                <UInput
                  v-model="state.applicationName"
                  placeholder="My App"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
              <UFormField label="Facebook App ID">
                <UInput
                  v-model="state.fbAppId"
                  placeholder="123456789"
                  class="w-full"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>
            </div>
          </div>
        </ToolInputGlow>
      </div>

      <!-- Right Column: Google Preview -->
      <div>
        <div class="relative group">
          <!-- Google branding header -->
          <div class="flex items-center gap-3 mb-3 sm:mb-4">
            <div class="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-red-500/10">
              <UIcon name="i-carbon-search" class="w-5 h-5 text-blue-500" />
            </div>
            <h3 class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
              Google Preview
            </h3>
          </div>

          <!-- Search result card -->
          <div class="bg-white dark:bg-[#202124] rounded-xl p-4 sm:p-5 border border-[var(--ui-border)] shadow-lg shadow-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/10">
            <!-- Favicon + URL breadcrumb -->
            <div class="flex items-center gap-2 mb-1 min-w-0">
              <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <UIcon name="i-carbon-globe" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs sm:text-sm text-[#202124] dark:text-[#bdc1c6] truncate">
                  {{ previewSiteName }}
                </p>
                <p class="text-[10px] sm:text-xs text-[#4d5156] dark:text-[#969ba1] truncate">
                  {{ previewUrl }}
                </p>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-lg sm:text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mt-2 leading-snug">
              {{ truncate(previewTitle, 60) }}
            </h3>

            <!-- Description -->
            <p class="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] mt-1 line-clamp-2 leading-relaxed">
              {{ truncate(previewDescription, 160) }}
            </p>
          </div>
        </div>
      </div>
    </Motion>

    <!-- Social Card Preview - Full Width -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.6 }"
      class="max-w-6xl mt-10"
    >
      <div class="relative bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[var(--ui-border)] shadow-xl shadow-black/5">
        <!-- Decorative corner accents -->
        <div class="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-l-2 border-t-2 border-amber-500/20 rounded-tl-2xl" />
        <div class="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-r-2 border-b-2 border-amber-500/20 rounded-br-2xl" />

        <!-- Header -->
        <div class="flex items-center gap-3 mb-4 sm:mb-6">
          <div class="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <UIcon name="i-carbon-share" class="w-5 h-5 text-amber-500" />
          </div>
          <h3 class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
            Social Card Preview
          </h3>
        </div>

        <!-- Platform tabs -->
        <div class="flex gap-1 sm:gap-1.5 mb-4 sm:mb-6 p-1 sm:p-1.5 bg-[var(--ui-bg-accented)]/30 backdrop-blur-sm rounded-xl border border-[var(--ui-border)]/50 overflow-x-auto -mx-1 px-1">
          <button
            v-for="tab in platformTabs"
            :key="tab.value"
            class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0"
            :class="[
              activePlatform === tab.value
                ? 'bg-[var(--ui-bg-elevated)] shadow-sm text-[var(--ui-text-highlighted)]'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)] hover:bg-[var(--ui-bg-elevated)]/50',
            ]"
            @click="activePlatform = tab.value"
          >
            <UIcon
              :name="tab.icon"
              class="w-3.5 h-3.5 transition-colors shrink-0"
              :class="activePlatform === tab.value ? tab.color : ''"
            />
            <span class="hidden sm:inline">{{ tab.label }}</span>
          </button>
        </div>

        <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <!-- Preview Column -->
          <div class="min-w-0">
            <!-- Twitter Preview -->
            <Motion
              v-if="activePlatform === 'twitter'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
            >
              <div
                class="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-neutral-900 shadow-lg"
                :class="state.twitterCard === 'summary_large_image' ? '' : 'flex'"
              >
                <div
                  v-if="state.twitterImage || previewImage"
                  class="bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden"
                  :class="state.twitterCard === 'summary_large_image' ? 'aspect-[1.91/1] w-full' : 'w-32 h-32 shrink-0'"
                >
                  <img :src="state.twitterImage || previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                  <div class="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5" />
                </div>
                <div v-else class="bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center" :class="state.twitterCard === 'summary_large_image' ? 'aspect-[1.91/1] w-full' : 'w-32 h-32 shrink-0'">
                  <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400" />
                </div>
                <div class="p-3 flex-1 min-w-0">
                  <p class="text-xs text-neutral-500 truncate">
                    {{ previewSiteName }}
                  </p>
                  <p class="text-sm text-neutral-900 dark:text-white font-medium truncate">
                    {{ truncate(previewTitle, 70) }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {{ truncate(previewDescription, 120) }}
                  </p>
                </div>
              </div>
            </Motion>

            <!-- Facebook Preview -->
            <Motion
              v-if="activePlatform === 'facebook'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
            >
              <div class="rounded overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-[#F0F2F5] dark:bg-[#242526] shadow-lg">
                <div v-if="previewImage" class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 relative overflow-hidden">
                  <img :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                </div>
                <div v-else class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <UIcon name="i-carbon-image" class="w-12 h-12 text-neutral-400" />
                </div>
                <div class="p-3 bg-[#F0F2F5] dark:bg-[#242526]">
                  <p class="text-xs text-neutral-500 uppercase tracking-wide truncate">
                    {{ previewSiteName }}
                  </p>
                  <p class="text-base text-neutral-900 dark:text-white font-semibold truncate mt-1">
                    {{ truncate(previewTitle, 70) }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                    {{ truncate(previewDescription, 120) }}
                  </p>
                </div>
              </div>
            </Motion>

            <!-- LinkedIn Preview -->
            <Motion
              v-if="activePlatform === 'linkedin'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
            >
              <div class="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-[#1B1F23] shadow-lg">
                <div v-if="previewImage" class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 relative overflow-hidden">
                  <img :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                </div>
                <div v-else class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <UIcon name="i-carbon-image" class="w-12 h-12 text-neutral-400" />
                </div>
                <div class="p-3">
                  <p class="text-sm text-neutral-900 dark:text-white font-semibold truncate">
                    {{ truncate(previewTitle, 70) }}
                  </p>
                  <p class="text-xs text-neutral-500 truncate mt-1">
                    {{ previewSiteName }}
                  </p>
                </div>
              </div>
            </Motion>

            <!-- WhatsApp Preview -->
            <Motion
              v-if="activePlatform === 'whatsapp'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
              class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div class="space-y-2">
                <p class="text-xs text-[var(--ui-text-dimmed)]">
                  Inline
                </p>
                <div class="rounded-lg overflow-hidden bg-[#DCF8C6] dark:bg-[#1F2C34] shadow-lg flex max-w-full sm:max-w-[240px]">
                  <div v-if="previewImage" class="w-14 h-14 bg-neutral-200 dark:bg-neutral-700 shrink-0">
                    <img :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                  </div>
                  <div v-else class="w-14 h-14 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                    <UIcon name="i-carbon-image" class="w-5 h-5 text-neutral-400" />
                  </div>
                  <div class="p-2 flex-1 min-w-0">
                    <p class="text-xs text-neutral-900 dark:text-[#E9EDEF] font-medium line-clamp-1">
                      {{ truncate(previewTitle, 40) }}
                    </p>
                    <p class="text-[10px] text-neutral-600 dark:text-[#8696A0] line-clamp-1 mt-0.5">
                      {{ truncate(previewDescription, 50) }}
                    </p>
                    <p class="text-[10px] text-neutral-500 dark:text-[#8696A0] truncate mt-0.5 flex items-center gap-1">
                      <UIcon name="i-carbon-link" class="w-2.5 h-2.5" />
                      {{ previewSiteName }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <p class="text-xs text-[var(--ui-text-dimmed)]">
                  Full card
                </p>
                <div class="rounded-lg overflow-hidden bg-[#DCF8C6] dark:bg-[#1F2C34] shadow-lg max-w-full sm:w-[240px]">
                  <div v-if="previewImage" class="aspect-[2/1] w-full bg-neutral-200 dark:bg-neutral-700">
                    <img :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                  </div>
                  <div v-else class="aspect-[2/1] w-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400" />
                  </div>
                  <div class="p-2.5">
                    <p class="text-sm text-neutral-900 dark:text-[#E9EDEF] font-medium line-clamp-2">
                      {{ truncate(previewTitle, 60) }}
                    </p>
                    <p class="text-xs text-neutral-600 dark:text-[#8696A0] line-clamp-2 mt-1">
                      {{ truncate(previewDescription, 80) }}
                    </p>
                  </div>
                </div>
              </div>
            </Motion>

            <!-- Slack Preview -->
            <Motion
              v-if="activePlatform === 'slack'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
            >
              <div class="border-l-4 border-purple-500 pl-4 py-2 bg-white dark:bg-[#1A1D21] rounded-r-lg">
                <p class="text-sm font-semibold text-neutral-900 dark:text-white">
                  {{ previewSiteName }}
                </p>
                <p class="text-sm text-[#1264A3] dark:text-[#1D9BD1] hover:underline cursor-pointer">
                  {{ truncate(previewTitle, 70) }}
                </p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {{ truncate(previewDescription, 120) }}
                </p>
                <!-- Slack label/data fields -->
                <div v-if="state.twitterLabel1 || state.twitterLabel2" class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <div v-if="state.twitterLabel1 && state.twitterData1" class="flex gap-1">
                    <span class="font-medium">{{ state.twitterLabel1 }}:</span>
                    <span>{{ state.twitterData1 }}</span>
                  </div>
                  <div v-if="state.twitterLabel2 && state.twitterData2" class="flex gap-1">
                    <span class="font-medium">{{ state.twitterLabel2 }}:</span>
                    <span>{{ state.twitterData2 }}</span>
                  </div>
                </div>
                <div v-if="previewImage" class="mt-2 rounded overflow-hidden max-w-xs">
                  <img :src="previewImage" :alt="previewTitle" class="w-full h-auto max-h-40 object-cover">
                </div>
              </div>
            </Motion>

            <!-- Discord Preview -->
            <Motion
              v-if="activePlatform === 'discord'"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.2 }"
            >
              <div class="rounded border-l-4 border-[#5865F2] bg-[#F2F3F5] dark:bg-[#2F3136] p-4 shadow-lg">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {{ previewSiteName }}
                </p>
                <p class="text-sm font-semibold text-[#006CE7] dark:text-[#00AFF4] hover:underline cursor-pointer">
                  {{ truncate(previewTitle, 70) }}
                </p>
                <p class="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 mt-1">
                  {{ truncate(previewDescription, 120) }}
                </p>
                <div v-if="previewImage" class="mt-3 rounded overflow-hidden">
                  <img :src="previewImage" :alt="previewTitle" class="max-w-full max-h-60 rounded object-cover">
                </div>
              </div>
            </Motion>
          </div>

          <!-- Inputs Column -->
          <div>
            <!-- Twitter Inputs -->
            <Motion
              v-if="activePlatform === 'twitter'"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.2 }"
              class="space-y-4"
            >
              <p class="text-xs text-[var(--ui-text-dimmed)]">
                Twitter/X uses Open Graph tags as fallback. Configure Twitter-specific overrides below.
              </p>
              <UFormField label="Card Type">
                <USelect v-model="state.twitterCard" :items="twitterCards" value-key="value" size="sm" class="w-full" />
              </UFormField>
              <UFormField label="Twitter Image" help="Override OG image for Twitter (different aspect ratio)">
                <UInput v-model="state.twitterImage" placeholder="https://example.com/twitter-card.png" size="sm" class="w-full" />
              </UFormField>
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Site @handle">
                  <UInput v-model="state.twitterSite" placeholder="@yoursite" size="sm" class="w-full" />
                </UFormField>
                <UFormField label="Creator @handle">
                  <UInput v-model="state.twitterCreator" placeholder="@author" size="sm" class="w-full" />
                </UFormField>
              </div>
            </Motion>

            <!-- Slack Inputs -->
            <Motion
              v-if="activePlatform === 'slack'"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.2 }"
              class="space-y-4"
            >
              <p class="text-xs text-[var(--ui-text-dimmed)]">
                Slack reads Open Graph tags and supports additional label/data fields for extra context.
              </p>
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Label 1">
                  <UInput v-model="state.twitterLabel1" placeholder="Reading time" size="sm" class="w-full" />
                </UFormField>
                <UFormField label="Data 1">
                  <UInput v-model="state.twitterData1" placeholder="5 min" size="sm" class="w-full" />
                </UFormField>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Label 2">
                  <UInput v-model="state.twitterLabel2" placeholder="Author" size="sm" class="w-full" />
                </UFormField>
                <UFormField label="Data 2">
                  <UInput v-model="state.twitterData2" placeholder="John Doe" size="sm" class="w-full" />
                </UFormField>
              </div>
            </Motion>

            <!-- Other Platforms Info -->
            <Motion
              v-if="['facebook', 'linkedin', 'whatsapp', 'discord'].includes(activePlatform)"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.2 }"
              class="space-y-4"
            >
              <div class="p-4 rounded-lg bg-[var(--ui-bg-accented)]/30 border border-[var(--ui-border)]">
                <div class="flex items-start gap-3">
                  <UIcon name="i-carbon-information" class="w-5 h-5 text-[var(--ui-text-muted)] mt-0.5 shrink-0" />
                  <div>
                    <p class="text-sm text-[var(--ui-text-highlighted)] font-medium mb-1">
                      Uses Open Graph Tags
                    </p>
                    <p class="text-xs text-[var(--ui-text-muted)]">
                      {{ activePlatform.charAt(0).toUpperCase() + activePlatform.slice(1) }} reads the standard Open Graph tags (og:title, og:description, og:image) configured in the form above.
                    </p>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </div>
    </Motion>

    <!-- Code Output -->
    <Motion
      v-if="hasAnyValue"
      ref="codeOutputRef"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.1 }"
      class="max-w-6xl mt-10"
    >
      <div class="relative bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm rounded-2xl border border-[var(--ui-border)] shadow-xl shadow-black/5 overflow-hidden">
        <!-- Terminal-style header -->
        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-[var(--ui-border)] bg-gradient-to-r from-gray-900/5 to-transparent dark:from-gray-100/5">
          <div class="flex items-center gap-3">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
              <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-carbon-code" class="w-4 h-4 text-amber-500" />
              <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">Generated Code</span>
            </div>
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
          <!-- Toolbar -->
          <div class="flex flex-wrap items-center gap-3">
            <FrameworkSelectorMinimal size="small" ignore-redirect />
            <div class="h-4 w-px bg-[var(--ui-border)] hidden sm:block" />
            <UTabs
              v-model="state.outputMode"
              :items="outputModes"
              size="xs"
              color="neutral"
              variant="pill"
              :content="false"
            />
          </div>
          <div class="max-w-none [&_pre]:!my-0 [&_pre]:!rounded-lg sm:[&_pre]:!rounded-xl">
            <ToolCodeBlock :code="generatedCode" :lang="codeLang" />
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <UButton variant="ghost" color="neutral" size="sm" icon="i-carbon-reset" class="opacity-60 hover:opacity-100 transition-opacity" @click="() => { reset(); track('reset') }">
          Reset All
        </UButton>
      </div>
    </Motion>

    <!-- Educational Content -->
    <div class="max-w-4xl space-y-10 sm:space-y-16 mt-16 sm:mt-24">
      <!-- Divider with gradient -->
      <div class="flex items-center gap-4">
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ui-border)] to-transparent" />
        <span class="text-xs font-medium text-[var(--ui-text-dimmed)] uppercase tracking-widest">Learn</span>
        <div class="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ui-border)] to-transparent" />
      </div>

      <section>
        <ToolSectionHeader title="Why Use useSeoMeta?" icon="i-carbon-flash" color="amber" />
        <p class="text-[var(--ui-text-muted)] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
          The useSeoMeta composable provides a type-safe, flat API for setting meta tags. Unlike manually writing meta tags, it handles all the complexity for you.
        </p>
        <div class="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <UIcon name="i-carbon-checkmark-filled" class="w-4 h-4 text-green-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">Type-safe</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Full TypeScript support with auto-completion</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <UIcon name="i-carbon-checkmark-filled" class="w-4 h-4 text-green-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">XSS-safe</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Values are properly escaped</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <UIcon name="i-carbon-checkmark-filled" class="w-4 h-4 text-green-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">SSR-ready</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Works seamlessly with server-side rendering</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <UIcon name="i-carbon-checkmark-filled" class="w-4 h-4 text-green-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">Flat API</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">No nested objects - just set properties directly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <ToolSectionHeader title="Meta Tag Best Practices" icon="i-carbon-idea" color="green" />
        <div class="grid md:grid-cols-2 gap-3 sm:gap-4">
          <div class="group relative p-4 sm:p-5 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="relative">
              <div class="flex items-center gap-2 mb-2 sm:mb-3">
                <UIcon name="i-carbon-text-short-paragraph" class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <h3 class="font-semibold text-sm sm:text-base text-[var(--ui-text-highlighted)]">
                  Title Tag
                </h3>
              </div>
              <ul class="text-xs sm:text-sm text-[var(--ui-text-muted)] space-y-1.5 sm:space-y-2">
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-amber-500 shrink-0" />Keep under 60 characters
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-amber-500 shrink-0" />Front-load important keywords
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-amber-500 shrink-0" />Make each page title unique
                </li>
              </ul>
            </div>
          </div>
          <div class="group relative p-4 sm:p-5 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="relative">
              <div class="flex items-center gap-2 mb-2 sm:mb-3">
                <UIcon name="i-carbon-text-align-left" class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <h3 class="font-semibold text-sm sm:text-base text-[var(--ui-text-highlighted)]">
                  Description
                </h3>
              </div>
              <ul class="text-xs sm:text-sm text-[var(--ui-text-muted)] space-y-1.5 sm:space-y-2">
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-blue-500 shrink-0" />Keep under 160 characters
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-blue-500 shrink-0" />Include a call to action
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-blue-500 shrink-0" />Match search intent
                </li>
              </ul>
            </div>
          </div>
          <div class="group relative p-4 sm:p-5 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="relative">
              <div class="flex items-center gap-2 mb-2 sm:mb-3">
                <UIcon name="i-carbon-share" class="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <h3 class="font-semibold text-sm sm:text-base text-[var(--ui-text-highlighted)]">
                  Open Graph
                </h3>
              </div>
              <ul class="text-xs sm:text-sm text-[var(--ui-text-muted)] space-y-1.5 sm:space-y-2">
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-purple-500 shrink-0" />Use 1200x630px images
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-purple-500 shrink-0" />Always set og:title and og:description
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-purple-500 shrink-0" />Include og:url for canonical sharing
                </li>
              </ul>
            </div>
          </div>
          <div class="group relative p-4 sm:p-5 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-sky-500/30 transition-all duration-300 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div class="relative">
              <div class="flex items-center gap-2 mb-2 sm:mb-3">
                <UIcon name="i-carbon-logo-x" class="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                <h3 class="font-semibold text-sm sm:text-base text-[var(--ui-text-highlighted)]">
                  Twitter Cards
                </h3>
              </div>
              <ul class="text-xs sm:text-sm text-[var(--ui-text-muted)] space-y-1.5 sm:space-y-2">
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-sky-500 shrink-0" />Use summary_large_image for articles
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-sky-500 shrink-0" />Include @handle for attribution
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1 h-1 rounded-full bg-sky-500 shrink-0" />Test with Twitter Card Validator
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <ToolSectionHeader title="Learn More" icon="i-carbon-book" color="purple" />
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <NuxtLink to="/docs/head/guides/get-started/installation" class="group">
            <UButton variant="soft" color="primary" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
              Installation Guide
            </UButton>
          </NuxtLink>
          <NuxtLink to="/docs/head/api/composables/use-seo-meta" class="group">
            <UButton variant="soft" color="neutral" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg transition-all">
              useSeoMeta API
            </UButton>
          </NuxtLink>
          <NuxtLink to="/docs/head/api/composables/use-head" class="group">
            <UButton variant="soft" color="neutral" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg transition-all">
              useHead API
            </UButton>
          </NuxtLink>
        </div>
      </section>

      <ToolFeedback tool-id="meta-tag-generator" />
    </div>
  </ToolPageLayout>
</template>
