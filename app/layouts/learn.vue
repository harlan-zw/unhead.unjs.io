<script lang="ts" setup>
const route = useRoute()

const { data: allLearn } = await useAsyncData('learn-nav', () => {
  return queryCollection('learn').select('title', 'path', 'navigation').all()
})

const categories = computed(() => {
  if (!allLearn.value)
    return []

  const guides = allLearn.value.filter(a => a.path.startsWith('/learn/guides'))
  const research = allLearn.value.filter(a => a.path.startsWith('/learn/research'))

  return [
    {
      key: 'guides',
      label: 'Guides',
      items: guides,
    },
    {
      key: 'research',
      label: 'Research',
      items: research,
    },
  ].filter(g => g.items.length > 0)
})
</script>

<template>
  <UMain class="relative mb-20 px-5">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-0 text-primary-300/30 dark:text-primary-900/30 pointer-events-none absolute w-full top-[1px] transition-all flex-shrink-0 opacity-100 duration-[400ms] z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="max-w-[1400px] mx-auto lg:pt-5">
      <UPage :ui="{ left: 'lg:col-span-3 xl:col-span-2', center: 'col-span-5 lg:col-span-7 xl:col-span-8' }">
        <template #left>
          <UPageAside class="max-w-[260px]">
            <nav aria-label="Learn Navigation" class="space-y-6">
              <div v-for="category in categories" :key="category.key">
                <div class="mb-2 pl-2.5">
                  <span class="text-[11px] font-medium uppercase tracking-widest text-dimmed">
                    {{ category.label }}
                  </span>
                </div>
                <ul class="space-y-0.5 border-l border-default">
                  <li v-for="article in category.items" :key="article.path">
                    <NuxtLink
                      :to="article.path"
                      class="group relative block pl-2.5 py-1 -ml-px border-l text-[13px] leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      :class="route.path === article.path
                        ? 'border-primary text-highlighted font-medium'
                        : 'border-transparent text-muted hover:text-default hover:border-accented'"
                    >
                      {{ article.navigation?.title || article.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </nav>
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </div>
  </UMain>
</template>
