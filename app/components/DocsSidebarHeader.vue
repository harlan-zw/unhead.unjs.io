<script setup lang="ts">
import { StackblitzPlaygrounds } from '~~/const'
import { useStats } from '~/composables/data'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

const { selectedFramework } = useFrameworkSelector()

const stats = await useStats()
const module = useModule(stats)
const nav = useDocsNav()

const topLinks = computed(() => [
  {
    title: 'Discord Support',
    icon: 'i-logos-discord-icon',
    to: 'https://discord.com/invite/275MBUBvgP',
  },
  {
    title: `${selectedFramework.value.label} Playground`,
    icon: 'i-logos-stackblitz-icon',
    to: StackblitzPlaygrounds[selectedFramework.value.slug]?.ssr,
  },
].filter(l => !!l.to))
</script>

<template>
  <div v-if="module && nav">
    <nav :key="selectedFramework?.slug" aria-title="Documentation Navigation" class="flex flex-col gap-7">
      <ul class="isolate -mx-2.5 -mb-2">
        <li v-for="link in topLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="group relative w-full px-2.5 py-1.5 before:inset-y-px before:inset-x-0 flex items-center gap-1.5 text-sm before:absolute before:z-[-1] before:rounded-[calc(var(--ui-radius)*1.5)] focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2 text-[var(--ui-text-toned)] focus-visible:before:ring-(--ui-primary) hover:text-(--ui-text-highlighted) hover:before:bg-(--ui-bg-elevated)/50 data-[state=open]:text-(--ui-text-highlighted) transition-colors before:transition-colors"
          >
            <div
              class="rounded-md p-1 inline-flex ring-inset ring-1 bg-neutral-100/10 dark:bg-neutral-800/50 ring-neutral-200 dark:ring-neutral-700 group-hover:bg-primary group-hover:ring-primary group-hover:text-background"
            >
              <UIcon :name="link.icon" class="w-4 h-4 text-[var(--ui-text-dimmed)] brightness-120 sepia" />
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
              <div :class="link.children?.length ? 'text-sm font-bold' : ''">
                {{ link.title }}
              </div>
            </div>
            <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamclic ass="w-4 h-4" />
          </div>
          <div v-else :class="link.deprecated ? 'opacity-50' : ''">
            <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
            <div v-html="link.title" />
          </div>
          <UIcon
            v-if="link.icon" :name="link.icon"
            class="w-4 h-4 transition-all hover:brightness-50 brightness-120"
            :class="active ? 'sepia-[0%] brightness-100' : ' sepia-[50%]'"
          />
          <div v-if="link.new">
            <UBadge size="sm" variant="subtle" color="success">
              New
            </UBadge>
          </div>
          <div v-else-if="link.deprecated" class="opacity-50">
            <UBadge size="sm" variant="subtle" color="neutral">
              Deprecated
            </UBadge>
          </div>
        </template>
      </ContentNavigation>
    </nav>
  </div>
</template>
