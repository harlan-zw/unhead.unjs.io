<script setup lang="ts">
import { StackblitzPlaygrounds } from '~~/const'
import { getPathSection, getPathWithoutFramework } from '~~/utils/urls'
import { useStats } from '~/composables/data'
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { useVersionSelector } from '~/composables/versionSelector'

const { selectedFramework } = useFrameworkSelector()
const { selectedVersion } = useVersionSelector()

const route = useRoute()

const stats = await useStats()
const module = useModule(stats)
const nav = useDocsNav()

const versionPrefix = computed(() => selectedVersion.value.slug === 'v2' ? '/docs/v2' : '/docs')

function docPath(path: string) {
  return `${versionPrefix.value}/${selectedFramework.value.slug}${path}`
}

const currentSection = computed(() => {
  const section = getPathSection(getPathWithoutFramework(route.path))
  if (section.includes('schema-org'))
    return 'schema-org'
  return 'head'
})

const sections = [
  { label: 'Head', slug: 'head', icon: 'i-heroicons-code-bracket', path: '/head/guides/get-started/overview' },
  { label: 'Schema.org', slug: 'schema-org', icon: 'i-heroicons-cube', path: '/schema-org/guides/get-started/overview' },
]

const activeSection = computed(() => sections.find(s => s.slug === currentSection.value) || sections[0])

const sectionMenuItems = computed(() => sections.map(s => ({
  label: s.label,
  icon: s.icon,
  active: s.slug === currentSection.value,
  onSelect: async () => await navigateTo(docPath(s.path)),
})))

const topLinks = computed(() => [
  {
    title: 'Discord Support',
    icon: 'i-carbon-logo-discord',
    to: 'https://discord.com/invite/275MBUBvgP',
  },
  {
    title: `${selectedFramework.value.label} Playground`,
    icon: 'i-carbon-lightning',
    to: StackblitzPlaygrounds[selectedFramework.value.slug]?.ssr,
  },
].filter(l => !!l.to))
</script>

<template>
  <div v-if="module && nav">
    <nav :key="selectedFramework?.slug" aria-title="Documentation Navigation" class="flex flex-col gap-7">
      <UDropdownMenu :items="sectionMenuItems" class="-mx-2.5 -mb-2">
        <button
          type="button"
          class="group flex w-full items-center gap-2 rounded-lg pl-2.5 pr-0 py-1.5 text-sm font-medium text-highlighted hover:bg-[var(--ui-bg-elevated)]/50 transition-colors"
        >
          <div class="shrink-0 rounded-md p-1 inline-flex bg-accented text-muted">
            <UIcon :name="activeSection.icon" class="size-3.5" />
          </div>
          <span>{{ activeSection.label }}</span>
          <UIcon name="i-heroicons-chevron-down-20-solid" class="ml-auto size-4 text-dimmed" />
        </button>
      </UDropdownMenu>
      <ul class="isolate -mx-2.5 -mb-2">
        <li v-for="link in topLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            :aria-label="link.title"
            class="group relative w-full px-2.5 py-1.5 before:inset-y-px before:inset-x-0 flex items-center gap-1.5 text-sm before:absolute before:z-[-1] before:rounded-[calc(var(--ui-radius)*1.5)] focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2 text-toned focus-visible:before:ring-(--ui-primary) hover:text-(--ui-text-highlighted) hover:before:bg-(--ui-bg-elevated)/50 data-[state=open]:text-(--ui-text-highlighted) transition-colors before:transition-colors"
          >
            <div
              class="rounded-md p-1 inline-flex ring-inset ring-1 bg-neutral-100/10 dark:bg-neutral-800/50 ring-neutral-200 dark:ring-neutral-700 group-hover:bg-primary group-hover:ring-primary group-hover:text-background"
            >
              <UIcon :name="link.icon" class="w-4 h-4 text-dimmed group-hover:text-[var(--ui-bg-inverted)]" />
            </div>
            <span class="truncate">{{ link.title }}</span>
          </NuxtLink>
        </li>
      </ul>
      <USeparator class="mt-0 pt-0" />
      <ContentNavigation
        as="div" default-open :collapsible="false" :navigation="nav?.bottom || []" highlight
        :ui="{ listWithChildren: 'sm:ml-0 mt-2' }"
      >
        <template #link="{ link, active }">
          <div
            v-if="!link.html" class="flex items-center justify-between gap-2 w-full"
            :class="link.deprecated ? 'opacity-50' : ''"
          >
            <div class="flex items-center gap-2">
              <div :class="link.children?.length ? 'text-sm font-bold' : ''" v-text="link.title" />
              <UBadge v-if="link.new" size="sm" variant="subtle" color="success">
                New
              </UBadge>
              <UBadge v-else-if="link.deprecated" size="sm" variant="subtle" color="neutral" class="opacity-50">
                Deprecated
              </UBadge>
            </div>
            <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamclic ass="w-4 h-4" />
          </div>
          <div v-else :class="link.deprecated ? 'opacity-50' : ''">
            <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
            <div v-html="link.title" />
          </div>
          <UIcon
            v-if="link.icon" :name="link.icon"
            class="w-4 h-4 shrink-0 transition-opacity"
            :class="active ? 'opacity-100' : 'opacity-40'"
          />
        </template>
      </ContentNavigation>
    </nav>
  </div>
</template>
