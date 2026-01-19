<script setup lang="ts">
import type { SchemaType } from '~/composables/useSchemaOrgGenerator'
import { useClipboard } from '@vueuse/core'
import { Motion } from 'motion-v'

useSeoMeta({
  title: 'Schema.org Generator - Generate useSchemaOrg Code',
  description: 'Free Schema.org markup generator for Vue, React, Nuxt, and more. Generate useSchemaOrg() code with JSON-LD preview.',
  ogTitle: 'Schema.org Generator | Unhead',
  ogDescription: 'Generate Schema.org structured data as useSchemaOrg() composable code. Preview JSON-LD output.',
})

const {
  state,
  schemaTypes,
  presets,
  currentSchemaConfig,
  hasAnyValue,
  generatedCode,
  codeLanguage,
  jsonLdPreview,
  reset,
  applyPreset,
  setSchemaType,
} = useSchemaOrgGenerator()

const { copy, copied } = useClipboard()

const inputFocused = ref(false)
const showJsonPreview = ref(true)

const outputModes = [
  { label: 'useSchemaOrg', value: 'useSchemaOrg' },
  { label: 'JSON-LD', value: 'jsonld' },
]

const codeMarkdown = computed(() => {
  const lang = codeLanguage.value === 'json' ? 'json' : 'ts'
  return `\`\`\`${lang}\n${generatedCode.value}\n\`\`\``
})

const jsonPreviewMarkdown = computed(() => {
  return `\`\`\`json\n${jsonLdPreview.value}\n\`\`\``
})

function handleTypeSelect(type: SchemaType) {
  setSchemaType(type)
}
</script>

<template>
  <ToolPageLayout color-scheme="purple">
    <ToolHero
      title="Schema.org Generator"
      description="Generate useSchemaOrg() code for rich search results. Build structured data for articles, products, FAQs, and more."
      color-scheme="purple"
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
          class="group relative overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/50 backdrop-blur-sm p-3 sm:p-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5"
          @click="applyPreset(preset)"
        >
          <!-- Hover gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div class="relative">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UIcon :name="preset.icon" class="size-3.5 sm:size-4 text-purple-500" />
              </div>
            </div>
            <span class="text-xs sm:text-sm font-semibold text-[var(--ui-text-highlighted)] group-hover:text-purple-500 transition-colors">{{ preset.label }}</span>
            <p class="text-[10px] sm:text-xs text-[var(--ui-text-dimmed)] mt-1 line-clamp-2">
              {{ preset.description }}
            </p>
          </div>
        </button>
      </div>
    </Motion>

    <!-- Main Content: Type Selector + Form + Preview -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.5 }"
      class="max-w-6xl"
    >
      <!-- Schema Type Selector -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10">
            <UIcon name="i-carbon-data-structured" class="w-5 h-5 text-purple-500" />
          </div>
          <h3 class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
            Schema Type
          </h3>
        </div>

        <!-- Mobile: horizontal scroll, Desktop: grid -->
        <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-5">
          <button
            v-for="schemaType in schemaTypes"
            :key="schemaType.type"
            type="button"
            class="group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 shrink-0 w-[140px] sm:w-auto"
            :class="[
              state.schemaType === schemaType.type
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                : 'border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/50 hover:border-purple-500/40 hover:bg-purple-500/5',
            ]"
            @click="handleTypeSelect(schemaType.type)"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="p-1.5 rounded-lg transition-colors shrink-0"
                :class="state.schemaType === schemaType.type ? 'bg-purple-500/20' : 'bg-[var(--ui-bg-accented)]'"
              >
                <UIcon
                  :name="schemaType.icon"
                  class="size-4 transition-colors"
                  :class="state.schemaType === schemaType.type ? 'text-purple-500' : 'text-[var(--ui-text-muted)]'"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm font-medium truncate transition-colors"
                  :class="state.schemaType === schemaType.type ? 'text-purple-500' : 'text-[var(--ui-text-highlighted)]'"
                >
                  {{ schemaType.label }}
                </p>
              </div>
            </div>
            <!-- Active indicator -->
            <div
              v-if="state.schemaType === schemaType.type"
              class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse"
            />
          </button>
        </div>
      </div>

      <!-- Form + JSON Preview Grid -->
      <div class="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <!-- Left Column: Form Fields -->
        <div>
          <ToolInputGlow :focused="inputFocused" color-scheme="purple">
            <div class="flex items-center gap-3 mb-6">
              <UIcon :name="currentSchemaConfig.icon" class="w-5 h-5 text-purple-500" />
              <div>
                <h4 class="font-semibold text-[var(--ui-text-highlighted)]">
                  {{ currentSchemaConfig.label }}
                </h4>
                <p class="text-xs text-[var(--ui-text-dimmed)]">
                  {{ currentSchemaConfig.description }}
                </p>
              </div>
            </div>

            <div class="space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-2 -mr-2">
              <template v-for="field in currentSchemaConfig.fields" :key="field.key">
                <UFormField :label="field.label" :help="field.help">
                  <template v-if="field.type === 'textarea'">
                    <UTextarea
                      v-model="state.fields[field.key]"
                      :placeholder="field.placeholder"
                      :rows="2"
                      class="w-full"
                      @focus="inputFocused = true"
                      @blur="inputFocused = false"
                    />
                  </template>
                  <template v-else-if="field.type === 'select'">
                    <USelect
                      v-model="state.fields[field.key]"
                      :items="field.options || []"
                      value-key="value"
                      :placeholder="`Select ${field.label}`"
                      class="w-full"
                    />
                  </template>
                  <template v-else-if="field.type === 'datetime'">
                    <UInput
                      v-model="state.fields[field.key]"
                      type="datetime-local"
                      class="w-full"
                      @focus="inputFocused = true"
                      @blur="inputFocused = false"
                    />
                  </template>
                  <template v-else>
                    <UInput
                      v-model="state.fields[field.key]"
                      :placeholder="field.placeholder"
                      :type="field.type === 'number' ? 'number' : 'text'"
                      class="w-full"
                      @focus="inputFocused = true"
                      @blur="inputFocused = false"
                    />
                  </template>
                </UFormField>
              </template>
            </div>
          </ToolInputGlow>
        </div>

        <!-- Right Column: JSON-LD Preview -->
        <div>
          <div class="relative group">
            <!-- Header - clickable on mobile to toggle -->
            <button
              type="button"
              class="flex items-center justify-between gap-3 mb-3 sm:mb-4 w-full text-left lg:cursor-default"
              @click="showJsonPreview = !showJsonPreview"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                  <UIcon name="i-carbon-code" class="w-5 h-5 text-violet-500" />
                </div>
                <h3 class="text-sm font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
                  JSON-LD Preview
                </h3>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  :icon="copied ? 'i-carbon-checkmark' : 'i-carbon-copy'"
                  :color="copied ? 'success' : 'neutral'"
                  variant="ghost"
                  size="xs"
                  @click.stop="copy(jsonLdPreview)"
                />
                <UIcon
                  name="i-carbon-chevron-down"
                  class="w-4 h-4 text-[var(--ui-text-muted)] transition-transform lg:hidden"
                  :class="{ 'rotate-180': showJsonPreview }"
                />
              </div>
            </button>

            <!-- Preview card with structured data visualization -->
            <div
              class="bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm rounded-xl border border-[var(--ui-border)] shadow-xl shadow-black/5 overflow-hidden transition-all duration-300"
              :class="showJsonPreview ? 'opacity-100' : 'hidden lg:block opacity-100'"
            >
              <!-- Schema type badge -->
              <div class="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--ui-border)] bg-gradient-to-r from-purple-500/5 to-transparent">
                <span class="text-[10px] font-mono uppercase tracking-wider text-purple-500">@type</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  {{ state.schemaType }}
                </span>
              </div>

              <!-- JSON preview -->
              <div class="p-4 max-h-[300px] sm:max-h-[400px] overflow-auto">
                <div class="max-w-none [&_pre]:!my-0 [&_pre]:!rounded-lg [&_pre]:!text-xs">
                  <pre><MDC :value="jsonPreviewMarkdown" /></pre>
                </div>
              </div>
            </div>

            <!-- Decorative elements -->
            <div class="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </Motion>

    <!-- Code Output -->
    <Motion
      v-if="hasAnyValue"
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
              <UIcon name="i-carbon-code" class="w-4 h-4 text-purple-500" />
              <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">Generated Code</span>
            </div>
          </div>
          <UButton
            :icon="copied ? 'i-carbon-checkmark' : 'i-carbon-copy'"
            :color="copied ? 'success' : 'neutral'"
            variant="soft"
            size="xs"
            class="transition-all"
            @click="copy(generatedCode)"
          >
            <span class="hidden sm:inline">{{ copied ? 'Copied!' : 'Copy' }}</span>
          </UButton>
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
            <pre><MDC :value="codeMarkdown" /></pre>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <UButton variant="ghost" color="neutral" size="sm" icon="i-carbon-reset" class="opacity-60 hover:opacity-100 transition-opacity" @click="reset">
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
        <ToolSectionHeader title="What is Schema.org?" icon="i-carbon-data-structured" color="purple" />
        <p class="text-[var(--ui-text-muted)] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
          Schema.org is a collaborative vocabulary for structured data that helps search engines understand your content. When implemented correctly, it can enable rich results in Google Search.
        </p>
        <div class="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UIcon name="i-carbon-search" class="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">Rich Results</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Enable enhanced search snippets with ratings, prices, and more</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UIcon name="i-carbon-analytics" class="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">Better CTR</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Rich snippets can significantly improve click-through rates</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UIcon name="i-carbon-machine-learning" class="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">AI-Ready</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">Structured data helps AI systems understand your content</span>
              </div>
            </div>
          </div>
          <div class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <UIcon name="i-carbon-checkmark-filled" class="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <strong class="text-[var(--ui-text-highlighted)] block mb-1">Type-Safe</strong>
                <span class="text-sm text-[var(--ui-text-muted)]">useSchemaOrg provides full TypeScript support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <ToolSectionHeader title="Supported Schema Types" icon="i-carbon-catalog" color="violet" />
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="schemaType in schemaTypes"
            :key="schemaType.type"
            class="group p-4 rounded-xl bg-[var(--ui-bg-elevated)]/50 border border-[var(--ui-border)] hover:border-violet-500/30 transition-all duration-300"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                <UIcon :name="schemaType.icon" class="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p class="font-semibold text-sm text-[var(--ui-text-highlighted)]">
                  {{ schemaType.label }}
                </p>
                <p class="text-xs text-[var(--ui-text-dimmed)]">
                  {{ schemaType.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <ToolSectionHeader title="Learn More" icon="i-carbon-book" color="blue" />
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <NuxtLink to="/docs/schema-org/getting-started/introduction" class="group">
            <UButton variant="soft" color="primary" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
              Schema.org Guide
            </UButton>
          </NuxtLink>
          <NuxtLink to="/docs/schema-org/api/core/use-schema-org" class="group">
            <UButton variant="soft" color="neutral" trailing-icon="i-carbon-arrow-right" size="sm" class="group-hover:shadow-lg transition-all">
              useSchemaOrg API
            </UButton>
          </NuxtLink>
          <UButton
            variant="soft"
            color="neutral"
            trailing-icon="i-carbon-launch"
            size="sm"
            as="a"
            href="https://developers.google.com/search/docs/appearance/structured-data/search-gallery"
            target="_blank"
            rel="noopener"
          >
            Google Rich Results
          </UButton>
        </div>
      </section>
    </div>
  </ToolPageLayout>
</template>
