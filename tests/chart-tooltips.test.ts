// @vitest-environment jsdom
import type { Component } from 'vue'
import {
  VisDonutSelectors,
  VisGroupedBarSelectors,
  VisScatterSelectors,
  VisStackedBarSelectors,
} from '@unovis/vue'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import { createApp, defineComponent, nextTick } from 'vue'
import ChartCruxLcp from '../app/components/content/ChartCruxLcp.vue'
import ChartDataTable from '../app/components/content/ChartDataTable.vue'
import ChartDclParadox from '../app/components/content/ChartDclParadox.vue'
import ChartDuplicateTags from '../app/components/content/ChartDuplicateTags.vue'
import ChartFcpComparison from '../app/components/content/ChartFcpComparison.vue'
import ChartFrameworkHealth from '../app/components/content/ChartFrameworkHealth.vue'
import ChartHeadBreakerImpact from '../app/components/content/ChartHeadBreakerImpact.vue'
import ChartLcpTrend from '../app/components/content/ChartLcpTrend.vue'
import ChartOgCompleteness from '../app/components/content/ChartOgCompleteness.vue'
import ChartTheNuxtParadox from '../app/components/content/ChartTheNuxtParadox.vue'
import ChartThirdPartyPollution from '../app/components/content/ChartThirdPartyPollution.vue'

let dispose: (() => void) | undefined

// jsdom has no layout or SVG transform lists. Without these, XY containers
// size every mark to zero and axis and line transitions throw.
const svgGeometry = {
  getBBox: () => ({ x: 0, y: 0, width: 24, height: 12 }),
  getComputedTextLength: () => 24,
  transform: {
    baseVal: {
      consolidate: () => null,
    },
  },
}

beforeAll(() => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(640)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
  for (const [name, value] of Object.entries(svgGeometry))
    Object.defineProperty(SVGElement.prototype, name, { configurable: true, value })
})

afterEach(() => {
  dispose?.()
  document.body.replaceChildren()
})

afterAll(() => {
  vi.restoreAllMocks()
  for (const name of Object.keys(svgGeometry))
    Reflect.deleteProperty(SVGElement.prototype, name)
})

async function mountChart(chart: Component) {
  const errors: unknown[] = []
  const onError = (event: ErrorEvent) => {
    errors.push(event.error)
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(chart)
  app.component('ChartDataTable', ChartDataTable)
  app.component('ClientOnly', defineComponent({
    setup: (_, { slots }) => () => slots.default?.(),
  }))
  app.config.errorHandler = error => errors.push(error)
  dispose = () => {
    app.unmount()
    window.removeEventListener('error', onError)
  }
  app.mount(host)
  await nextTick()
  return { errors, host }
}

it.each<[string, Component, string, string]>([
  [
    'ChartCruxLcp',
    ChartCruxLcp,
    VisGroupedBarSelectors.bar,
    'LCP:',
  ],
  [
    'ChartDclParadox',
    ChartDclParadox,
    VisGroupedBarSelectors.bar,
    'DCL:',
  ],
  [
    'ChartDuplicateTags',
    ChartDuplicateTags,
    VisGroupedBarSelectors.bar,
    'Duplicate title:',
  ],
  [
    'ChartFcpComparison',
    ChartFcpComparison,
    VisGroupedBarSelectors.bar,
    'Optimal: 460ms',
  ],
  [
    'ChartFrameworkHealth',
    ChartFrameworkHealth,
    VisStackedBarSelectors.bar,
    'Changed:',
  ],
  [
    'ChartHeadBreakerImpact',
    ChartHeadBreakerImpact,
    VisDonutSelectors.segment,
    'Valid Heads: 78%',
  ],
  [
    'ChartLcpTrend',
    ChartLcpTrend,
    VisScatterSelectors.point,
    'Nuxt: 3059ms',
  ],
  [
    'ChartOgCompleteness',
    ChartOgCompleteness,
    VisGroupedBarSelectors.bar,
    'og:title:',
  ],
  [
    'ChartTheNuxtParadox',
    ChartTheNuxtParadox,
    VisGroupedBarSelectors.bar,
    'TTFB:',
  ],
  [
    'ChartThirdPartyPollution',
    ChartThirdPartyPollution,
    VisStackedBarSelectors.bar,
    'First-party:',
  ],
])('%s shows its tooltip when a mark is hovered', async (_name, chart, selector, expected) => {
  const { errors, host } = await mountChart(chart)
  const mark = await vi.waitFor(() => {
    const element = host.querySelector(`.${selector}`)
    expect(element).not.toBeNull()
    return element!
  })

  mark.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))

  await vi.waitFor(() => {
    expect(errors).toEqual([])
    expect(host.textContent).toContain(expected)
  })
  expect(host.textContent).not.toContain('undefined')
})
