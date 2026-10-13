import type { CallExpression } from '@babel/types'
import { parse } from '@babel/parser'
import { textContent } from 'minimark'

/**
 * Generic function to walk through a payload structure and find specified elements
 * @param node The current node to process (could be a string or array)
 * @param predicate Function to determine if the current node matches criteria
 * @param callback Function called when a matching element is found
 * @param path Current path in the tree structure
 */
export function walk<T = any>(
  node: any,
  predicate: (node: any, path: string[]) => boolean,
  callback: (node: T, path: string[]) => void,
  path: string[] = [],
): void {
  // Handle arrays (most content elements are arrays)
  if (Array.isArray(node)) {
    // Check if this node matches the predicate
    if (predicate(node, path)) {
      callback(node as T, path)
    }

    // Process children
    for (let i = 0; i < node.length; i++) {
      walk(node[i], predicate, callback, [...path, i.toString()])
    }
  }
  // Handle objects (like attributes)
  else if (node && typeof node === 'object') {
    // Check if this object matches the predicate
    if (predicate(node, path)) {
      callback(node as T, path)
    }

    // Process each property of the object
    for (const key of Object.keys(node)) {
      walk(node[key], predicate, callback, [...path, key])
    }
  }
}

export function stripHeaderAnchorLinks(payload: any) {
  // match header tag then see if a is inside to a #
  walk(payload, (node) => {
    return Array.isArray(node) && typeof node[0] === 'string' && node[0].startsWith('h')
  }, (child) => {
    if (child[1].id) {
      // remove the id
      delete child[1].id
    }
  })
}

// Matches paths that already have a framework
const FrameworkPattern = /^\/docs\/(?:vue|typescript|react|svelte|solid-js|angular|nuxt)\//
// Matches framework-agnostic paths that should NOT get a framework prefix
const AgnosticPattern = /^\/docs\/(?:schema-org|head|releases|migration-guide)\//

export function modifyRelativeDocLinksWithFramework(
  payload: any,
  framework?: string,
): any[] {
  const links = []
  // find a tags and check the href, if it's relative and contains docs and does not have a framework
  // then we should add the framework
  walk(
    payload,
    node => Array.isArray(node) && node[0] === 'a' && typeof node[1].href === 'string',
    (node) => {
      const href = node[1].href
      // Only add framework if link starts with /docs/, doesn't already have a framework,
      // and is not a framework-agnostic path (schema-org, head)
      if (framework && href.startsWith('/docs/') && !FrameworkPattern.test(href) && !AgnosticPattern.test(href)) {
        // add the framework to the href
        node[1].href = href.replace('/docs/', `/docs/${framework}/`)
      }
      // while we're here make any absolute links target="_blank"
      else if (href.startsWith('http') && !href.includes('/docs/')) {
        node[1].target = '_blank'
        node[1].rel = 'noopener noreferrer'
      }
      links.push(node)
    },
  )
  return links
}

export function replaceImportSpecifier(
  payload: any,
  mapping: Record<string, string>,
  correctUseHeadForTypeScript: boolean,
): void {
  walk(
    payload,
    node => Array.isArray(node) && node[0] === 'pre',
    (node) => {
      if (node[1].code) {
        // do a string replace of the "copy"
        for (const [oldImport, newImport] of Object.entries(mapping)) {
          node[1].code = node[1].code.replaceAll(oldImport, newImport)
        }
      }
      rewriteCodeText(node, (text) => {
        for (const [oldImport, newImport] of Object.entries(mapping))
          text = text.replaceAll(oldImport, newImport)
        return text
      })
      const code = textContent(node) || node[1].code || ''
      node[1].code = code
      const names = [
        ...(Object.values(mapping).includes('unhead') ? ['useHead', 'useSeoMeta', 'useHeadSafe', 'useScript', 'useServerHead'] : []),
        ...(Object.values(mapping).includes('@unhead/schema-org') ? ['useSchemaOrg'] : []),
      ]
      if (correctUseHeadForTypeScript && names.some(name => code.includes(name))) {
        const result = findInstanceArguments(code, names)
        if (result._tag === 'PartialSnippet') {
          // Documentation may intentionally contain incomplete JavaScript.
          console.warn('[docs] Keep the instance arguments in a partial code example.', result.reason)
        }
        else {
          for (const position of result.positions.toSorted((a, b) => b.offset - a.offset))
            node[1].code = node[1].code.slice(0, position.offset) + position.argument + node[1].code.slice(position.offset)
          let offset = 0
          rewriteCodeText(node, (text) => {
            const positions = result.positions.filter(position => position.offset >= offset && position.offset < offset + text.length)
            const start = offset
            offset += text.length
            for (const position of positions.toSorted((a, b) => b.offset - a.offset)) {
              const index = position.offset - start
              text = text.slice(0, index) + position.argument + text.slice(index)
            }
            return text
          })
        }
      }
      if (textContent(node))
        node[1].code = textContent(node)
    },
  )
}

function rewriteCodeText(node: any[], rewrite: (text: string) => string): void {
  for (let index = 2; index < node.length; index++) {
    if (typeof node[index] === 'string')
      node[index] = rewrite(node[index])
    else if (Array.isArray(node[index]))
      rewriteCodeText(node[index], rewrite)
  }
}

function findInstanceArguments(code: string, names: string[]):
  | { _tag: 'Parsed', positions: { offset: number, argument: string }[] }
  | { _tag: 'PartialSnippet', reason: string } {
  let ast
  try {
    ast = parse(code, { sourceType: 'unambiguous', plugins: ['typescript', 'jsx'] })
  }
  catch (error) {
    if (error instanceof SyntaxError)
      return { _tag: 'PartialSnippet', reason: error.message }
    throw error
  }
  const positions: { offset: number, argument: string }[] = []
  const importedCalls = new Map<string, boolean>()
  for (const statement of ast.program.body) {
    if (statement.type !== 'ImportDeclaration')
      continue
    for (const specifier of statement.specifiers) {
      if (specifier.type !== 'ImportSpecifier')
        continue
      const name = specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value
      if (names.includes(name))
        importedCalls.set(specifier.local.name, ['unhead', '@unhead/schema-org'].includes(statement.source.value))
    }
  }
  walk(ast, node => node?.type === 'CallExpression', (node: CallExpression) => {
    if (node.callee.type !== 'Identifier')
      return
    const imported = importedCalls.get(node.callee.name)
    if (imported === false || (!names.includes(node.callee.name) && imported !== true))
      return
    const first = node.arguments[0]
    if (first?.type === 'Identifier' && ['unheadInstance', 'head', 'unhead'].includes(first.name))
      return
    const start = node.typeArguments?.end ?? node.callee.end
    if (start == null)
      return
    const open = code.indexOf('(', start)
    if (open === -1)
      return
    positions.push({ offset: open + 1, argument: `unheadInstance${node.arguments.length ? ', ' : ''}` })
  })
  return { _tag: 'Parsed', positions }
}
