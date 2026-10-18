// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, defineComponent, nextTick } from 'vue'
import ChartDataTable from '../app/components/content/ChartDataTable.vue'
import ChartHeadBreakerImpact from '../app/components/content/ChartHeadBreakerImpact.vue'

let dispose: (() => void) | undefined

afterEach(() => {
  dispose?.()
  document.body.replaceChildren()
})

it('renders both donut segments without chart initialization errors', async () => {
  const errors: unknown[] = []
  const onError = (event: ErrorEvent) => {
    errors.push(event.error)
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ChartHeadBreakerImpact)
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
  await nextTick()

  await vi.waitFor(() => {
    expect(errors).toEqual([])
    expect(host.querySelectorAll('path[style*="fill:"]')).toHaveLength(2)
  })
  const svg = host.querySelector('svg')
  expect(svg?.getAttribute('width')).toBe('160')
  expect(svg?.getAttribute('height')).toBe('160')
  for (const segment of host.querySelectorAll('path[style*="fill:"]')) {
    expect(segment.getAttribute('d')).toMatch(/^M/)
    expect(segment.getAttribute('d')).not.toContain('NaN')
  }
  expect(host.textContent).toContain('22%')
})

it('renders the data table when the client chart is unavailable', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ChartHeadBreakerImpact)
  app.component('ChartDataTable', ChartDataTable)
  app.component('ClientOnly', defineComponent({
    setup: (_, { slots }) => () => slots.fallback?.(),
  }))
  dispose = () => app.unmount()
  app.mount(host)
  await nextTick()

  expect(host.querySelector('caption')?.textContent).toBe('The Head-Breaker Prevalence')
  const rows = [...host.querySelectorAll('tbody tr')]
    .map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent))
  expect(rows).toEqual([
    ['Invalid Heads (Breakers)', '22'],
    ['Valid Heads', '78'],
  ])
})
