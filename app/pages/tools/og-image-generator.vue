<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Motion } from 'motion-v'
import { useOgImageGenerator } from '~/composables/useOgImageGenerator'
import { useTakumiRenderer } from '~/composables/useTakumiRenderer'

const { track, trackView } = useToolAnalytics('og-image-generator')
onMounted(trackView)

useSeoMeta({
  title: 'OG Image Generator - Create Open Graph Images',
  description: 'Free OG Image generator for your social media cards. Design, preview and export Open Graph images instantly.',
  ogTitle: 'OG Image Generator | Unhead',
  ogDescription: 'Generate beautiful Open Graph images for your website. Live preview and export.',
})

const {
  title,
  description,
  backgroundColor,
  textColor,
  selectedTemplate,
  templateOptions,
  code,
  customCode,
  usageCode,
  // New fields
  siteName,
  author,
  themeColor,
  logo,
  productImage,
  price,
  brand,
} = useOgImageGenerator()

const { isReady, isRendering, result, error, render } = useTakumiRenderer()

// Image dimensions
const imageWidth = ref(1200)
const imageHeight = ref(630)

// Debounced render to avoid spamming the worker
const debouncedRender = useDebounceFn(() => {
  render(code.value, {
    width: imageWidth.value,
    height: imageHeight.value,
    format: 'png',
  })
}, 500)

watch([code, selectedTemplate, imageWidth, imageHeight], () => {
  debouncedRender()
})

watch(isReady, (ready) => {
  if (ready) {
    debouncedRender()
  }
})

const { copy, copied } = useClipboard()

const inputFocused = ref(false)

function downloadImage() {
  if (!result.value)
    return
  const link = document.createElement('a')
  link.href = result.value
  link.download = 'og-image.png'
  link.click()
  track('download')
}

const activePlatform = ref('twitter')
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

const previewTitle = computed(() => title.value || 'Your Page Title')
const previewDescription = computed(() => description.value || 'Your page description will appear here.')
const previewSiteName = computed(() => siteName.value || 'example.com')
const previewImage = result
</script>

<template>
  <ToolPageLayout color-scheme="purple">
    <ToolHero
      title="OG Image Generator"
      description="Design and generate Open Graph images for your website. Live preview and export as PNG."
      color-scheme="purple"
    />

    <ClientOnly>
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
        class="grid gap-8 lg:gap-10 max-w-7xl transition-all duration-300"
        :class="selectedTemplate === 'code' ? 'lg:grid-cols-2' : 'lg:grid-cols-[minmax(320px,400px)_1fr]'"
      >
        <!-- Left Column: Controls -->
        <div class="order-2 lg:order-1">
          <ToolInputGlow :focused="inputFocused" color-scheme="purple">
            <div class="space-y-6">
              <UFormField label="Template">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tmpl in templateOptions"
                    :key="tmpl"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors"
                    :class="selectedTemplate === tmpl ? 'bg-purple-500/20 border-purple-500 text-purple-500' : 'bg-[var(--ui-bg-elevated)] border-[var(--ui-border)] hover:border-purple-500/50'"
                    @click="selectedTemplate = tmpl"
                  >
                    <UIcon v-if="tmpl === 'code'" name="i-carbon-code" class="w-3.5 h-3.5" />
                    <span class="capitalize">{{ tmpl }}</span>
                  </button>
                </div>
              </UFormField>

              <UFormField v-if="selectedTemplate === 'code'" label="JSX Code">
                <ToolCodeEditor
                  v-model="customCode"
                  placeholder="export default function OgImage() { ... }"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                />
              </UFormField>

              <div v-else class="space-y-6">
                <!-- Common Fields -->
                <UFormField :label="selectedTemplate === 'product' ? 'Product Name' : 'Title'">
                  <UInput
                    v-model="title"
                    placeholder="Title"
                    size="lg"
                    class="w-full"
                    @focus="inputFocused = true"
                    @blur="inputFocused = false"
                  />
                </UFormField>

                <UFormField label="Description">
                  <UTextarea
                    v-model="description"
                    placeholder="Description"
                    :rows="3"
                    class="w-full"
                    @focus="inputFocused = true"
                    @blur="inputFocused = false"
                  />
                </UFormField>

                <!-- Template Specific Fields -->
                <div v-if="['blog', 'docs'].includes(selectedTemplate)" class="grid grid-cols-2 gap-4">
                  <UFormField :label="selectedTemplate === 'blog' ? 'Category' : 'Site Name'">
                    <UInput v-model="siteName" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                  <UFormField v-if="selectedTemplate === 'blog'" label="Author">
                    <UInput v-model="author" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                </div>

                <div v-if="selectedTemplate === 'product'" class="grid grid-cols-2 gap-4">
                  <UFormField label="Brand">
                    <UInput v-model="brand" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                  <UFormField label="Price">
                    <UInput v-model="price" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                </div>

                <div v-if="['blog', 'docs'].includes(selectedTemplate)">
                  <UFormField :label="selectedTemplate === 'blog' ? 'Avatar URL' : 'Icon URL'">
                    <UInput v-model="logo" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                </div>

                <div v-if="selectedTemplate === 'product'">
                  <UFormField label="Product Image URL">
                    <UInput v-model="productImage" class="w-full" @focus="inputFocused = true" @blur="inputFocused = false" />
                  </UFormField>
                </div>

                <!-- Colors -->
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Background Color">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="backgroundColor"
                        type="color"
                        class="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                      >
                      <UInput v-model="backgroundColor" class="flex-1" />
                    </div>
                  </UFormField>

                  <UFormField label="Text Color">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="textColor"
                        type="color"
                        class="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                      >
                      <UInput v-model="textColor" class="flex-1" />
                    </div>
                  </UFormField>
                </div>

                <div v-if="['blog', 'docs'].includes(selectedTemplate)" class="grid grid-cols-2 gap-4">
                  <UFormField :label="selectedTemplate === 'blog' ? 'Tag Color' : 'Accent Color'">
                    <div class="flex items-center gap-2">
                      <input
                        v-model="themeColor"
                        type="color"
                        class="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                      >
                      <UInput v-model="themeColor" class="flex-1" />
                    </div>
                  </UFormField>
                </div>

                <!-- Dimensions -->
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Width">
                    <UInput v-model.number="imageWidth" type="number" :min="200" :max="2400" class="w-full" />
                  </UFormField>
                  <UFormField label="Height">
                    <UInput v-model.number="imageHeight" type="number" :min="200" :max="1260" class="w-full" />
                  </UFormField>
                </div>
              </div>
            </div>
          </ToolInputGlow>
        </div>

        <!-- Right Column: Preview -->
        <div class="space-y-6 order-1 lg:order-2">
          <div class="relative bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-[var(--ui-border)] shadow-xl shadow-black/5">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 ring-1 ring-purple-500/20">
                  <UIcon name="i-carbon-share" class="w-5 h-5 text-purple-500" />
                </div>
                <h3 class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
                  Social Card Preview
                </h3>
                <UIcon v-show="isRendering" name="i-carbon-circle-dash" class="w-4 h-4 text-purple-500 animate-spin" />
              </div>
              <UButton
                v-if="result"
                icon="i-carbon-download"
                size="sm"
                variant="soft"
                color="primary"
                @click="downloadImage"
              >
                Download PNG
              </UButton>
            </div>

            <!-- Platform tabs -->
            <div class="flex gap-1.5 mb-6 p-1.5 bg-[var(--ui-bg-accented)]/30 backdrop-blur-sm rounded-xl border border-[var(--ui-border)]/50 overflow-x-auto">
              <button
                v-for="tab in platformTabs"
                :key="tab.value"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0"
                :class="[
                  activePlatform === tab.value
                    ? 'bg-[var(--ui-bg-elevated)] shadow-sm text-[var(--ui-text-highlighted)] ring-1 ring-[var(--ui-border)]'
                    : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text-highlighted)] hover:bg-[var(--ui-bg-elevated)]/50',
                ]"
                @click="activePlatform = tab.value"
              >
                <UIcon
                  :name="tab.icon"
                  class="w-4 h-4 transition-colors shrink-0"
                  :class="activePlatform === tab.value ? tab.color : ''"
                />
                <span class="hidden sm:inline">{{ tab.label }}</span>
              </button>
            </div>

            <!-- Preview Container -->
            <div class="min-w-0 flex justify-center">
              <!-- Twitter Preview -->
              <Motion
                v-if="activePlatform === 'twitter'"
                :initial="{ opacity: 0, scale: 0.98 }"
                :animate="{ opacity: 1, scale: 1 }"
                :transition="{ duration: 0.2 }"
                class="w-full max-w-lg"
              >
                <div class="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-neutral-900 shadow-lg">
                  <div class="aspect-[1.91/1] w-full bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                    </div>
                    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center text-red-500 p-2 text-center text-xs">
                      {{ error }}
                    </div>
                    <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                    <div v-else class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400 opacity-50" />
                    </div>
                    <div class="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none" />
                  </div>
                  <div class="p-3 min-w-0">
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
                class="w-full max-w-lg"
              >
                <div class="rounded overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-[#F0F2F5] dark:bg-[#242526] shadow-lg">
                  <div class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 relative overflow-hidden">
                    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                    </div>
                    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center text-red-500 p-2 text-center text-xs">
                      {{ error }}
                    </div>
                    <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                    <div v-else class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-image" class="w-12 h-12 text-neutral-400" />
                    </div>
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
                class="w-full max-w-lg"
              >
                <div class="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700/50 bg-white dark:bg-[#1B1F23] shadow-lg">
                  <div class="aspect-[1.91/1] w-full bg-neutral-200 dark:bg-neutral-700 relative overflow-hidden">
                    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                    </div>
                    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center text-red-500 p-2 text-center text-xs">
                      {{ error }}
                    </div>
                    <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                    <div v-else class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-image" class="w-12 h-12 text-neutral-400" />
                    </div>
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
                class="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div class="space-y-2">
                  <p class="text-xs text-[var(--ui-text-dimmed)]">
                    Inline
                  </p>
                  <div class="rounded-lg overflow-hidden bg-[#DCF8C6] dark:bg-[#1F2C34] shadow-lg flex max-w-full sm:max-w-[240px]">
                    <div class="w-14 h-14 bg-neutral-200 dark:bg-neutral-700 shrink-0 relative">
                      <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                        <UIcon name="i-carbon-circle-dash" class="w-4 h-4 animate-spin text-[var(--ui-text-muted)]" />
                      </div>
                      <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <UIcon name="i-carbon-image" class="w-5 h-5 text-neutral-400" />
                      </div>
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
                    <div class="aspect-[2/1] w-full bg-neutral-200 dark:bg-neutral-700 relative">
                      <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                        <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                      </div>
                      <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-full object-cover">
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400" />
                      </div>
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
                class="w-full max-w-lg"
              >
                <div class="border-l-4 border-purple-500 pl-4 py-3 bg-white dark:bg-[#1A1D21] rounded-r-lg">
                  <p class="text-sm font-semibold text-neutral-900 dark:text-white">
                    {{ previewSiteName }}
                  </p>
                  <p class="text-sm text-[#1264A3] dark:text-[#1D9BD1] hover:underline cursor-pointer">
                    {{ truncate(previewTitle, 70) }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {{ truncate(previewDescription, 120) }}
                  </p>
                  <div class="mt-2 rounded overflow-hidden max-w-xs bg-neutral-100 dark:bg-neutral-800 relative min-h-[100px]">
                    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                    </div>
                    <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="w-full h-auto max-h-40 object-cover">
                    <div v-else class="w-full h-[100px] flex items-center justify-center">
                      <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400 opacity-50" />
                    </div>
                  </div>
                </div>
              </Motion>

              <!-- Discord Preview -->
              <Motion
                v-if="activePlatform === 'discord'"
                :initial="{ opacity: 0, scale: 0.98 }"
                :animate="{ opacity: 1, scale: 1 }"
                :transition="{ duration: 0.2 }"
                class="w-full max-w-lg"
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
                  <div class="mt-3 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-700 relative min-h-[100px]">
                    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center">
                      <UIcon name="i-carbon-circle-dash" class="w-6 h-6 animate-spin text-[var(--ui-text-muted)]" />
                    </div>
                    <img v-else-if="previewImage" :src="previewImage" :alt="previewTitle" class="max-w-full max-h-60 rounded object-cover">
                    <div v-else class="w-full h-[100px] flex items-center justify-center">
                      <UIcon name="i-carbon-image" class="w-8 h-8 text-neutral-400 opacity-50" />
                    </div>
                  </div>
                </div>
              </Motion>
            </div>

            <div class="flex justify-end mt-4">
              <a href="https://takumi.kane.tw/" target="_blank" rel="noopener" class="text-xs text-[var(--ui-text-dimmed)] hover:text-purple-500 transition-colors flex items-center gap-1.5">
                <UIcon name="i-carbon-flash" class="w-3 h-3" />
                Powered by Takumi
              </a>
            </div>
          </div>

          <!-- Code Snippet -->
          <div class="bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm rounded-xl border border-[var(--ui-border)] overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--ui-border)] bg-[var(--ui-bg-accented)]/10">
              <span class="text-xs font-medium text-[var(--ui-text-muted)]">Unhead Usage</span>
              <UButton
                :icon="copied ? 'i-carbon-checkmark' : 'i-carbon-copy'"
                :color="copied ? 'success' : 'neutral'"
                variant="ghost"
                size="xs"
                @click="() => { copy(usageCode); track('copy') }"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </UButton>
            </div>
            <div class="p-4">
              <ToolCodeBlock :code="usageCode" lang="ts" />
            </div>
          </div>
        </div>
      </Motion>
    </ClientOnly>

    <div class="mt-16">
      <RelatedTools />
      <ToolFeedback tool-id="og-image-generator" />
    </div>
  </ToolPageLayout>
</template>
