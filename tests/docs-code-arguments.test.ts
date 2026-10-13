import { textContent } from 'minimark'
import { describe, expect, it } from 'vitest'
import { replaceImportSpecifier } from '../utils/content'

function transform(source: string) {
  const pre = ['pre', { language: 'ts', code: source }, ['code', {}, ['span', {}, source]]] as [string, { language: string, code: string }, any[]]
  replaceImportSpecifier([pre], {
    '@unhead/dynamic-import': 'unhead',
    '@unhead/schema-org/@framework': '@unhead/schema-org',
  }, true)
  return { copy: pre[1].code, visible: textContent(pre as any) }
}

describe('typeScript documentation instance arguments', () => {
  it.each([
    ['const entry = useHeadSafe({ title: input.title })', 'const entry = useHeadSafe(unheadInstance, { title: input.title })'],
    ['useSchemaOrg([defineArticle({ headline: title })])', 'useSchemaOrg(unheadInstance, [defineArticle({ headline: title })])'],
    ['useHead()', 'useHead(unheadInstance)'],
    ['useHeadSafe(unheadInstance, input)', 'useHeadSafe(unheadInstance, input)'],
    ['useHead(head, input)', 'useHead(head, input)'],
    ['const sample = "useHead({})"; // useHead({})', 'const sample = "useHead({})"; // useHead({})'],
    ['const example = /useHead\\(/', 'const example = /useHead\\(/'],
    ['import { useHead } from \'@unhead/vue\'; useHead({ title: \'Vue\' })', 'import { useHead } from \'@unhead/vue\'; useHead({ title: \'Vue\' })'],
    ['import { useHead as setHead } from \'unhead\'; setHead({})', 'import { useHead as setHead } from \'unhead\'; setHead(unheadInstance, {})'],
  ])('keeps call syntax valid for %s', (source, expected) => {
    expect(transform(source)).toEqual({ copy: expected, visible: expected })
  })
})
