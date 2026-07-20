import { describe, expect, it } from 'vitest'
import { parseOgImageJsx } from '../app/workers/parse-og-image-jsx'
import { useOgImageGenerator } from '../layers/tools/app/composables/useOgImageGenerator'

describe('parseOgImageJsx', () => {
  it('evaluates declarative JSX without running JavaScript', () => {
    expect(parseOgImageJsx(`
      export default function Card() {
        return (
          <div style={{ width: 1200, color: '#fff' }}>
            <h1>Hello</h1>
            {true && <span>World</span>}
          </div>
        )
      }
    `)).toEqual({
      type: 'div',
      props: {
        style: { width: 1200, color: '#fff' },
        children: [
          { type: 'h1', props: { children: 'Hello' } },
          { type: 'span', props: { children: 'World' } },
        ],
      },
    })
  })

  it.each([
    ['network calls', 'export default function Card() { return <div>{fetch("/api/admin")}</div> }'],
    ['global access', 'export default function Card() { return <div>{globalThis.location}</div> }'],
    ['constructor escapes', 'export default function Card() { return <div>{({}).constructor.constructor("return globalThis")()}</div> }'],
    ['extra statements', 'const secret = 1; export default function Card() { return <div /> }'],
    ['spread attributes', 'export default function Card() { return <div {...props} /> }'],
    ['custom components', 'export default function Card() { return <Component /> }'],
  ])('rejects %s', (_, code) => {
    expect(() => parseOgImageJsx(code)).toThrow()
  })

  it('keeps generated user text declarative even when it contains JSX syntax', () => {
    const generator = useOgImageGenerator()
    generator.title.value = '</h1>{globalThis.location}<h1>'
    generator.description.value = 'Quotes: " \' & braces: {}'

    const node = parseOgImageJsx(generator.code.value)
    expect(JSON.stringify(node)).toContain('</h1>{globalThis.location}<h1>')
    expect(JSON.stringify(node)).toContain('Quotes:')
  })
})
