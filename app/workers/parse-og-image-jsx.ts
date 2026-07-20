import type { Node } from '@babel/types'
import { parse } from '@babel/parser'

const MAX_SOURCE_LENGTH = 50_000
const MAX_EVALUATED_NODES = 5_000
const MAX_DEPTH = 100
const AllowedElements = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'])
const BlockedPropertyNames = new Set(['__proto__', 'constructor', 'prototype'])

export interface OgImageJsxNode {
  type: string
  props: Record<string, unknown>
}

interface EvaluationState {
  evaluatedNodes: number
}

function fail(message: string): never {
  throw new Error(`Unsupported JSX: ${message}`)
}

function visit(state: EvaluationState, depth: number) {
  state.evaluatedNodes += 1
  if (state.evaluatedNodes > MAX_EVALUATED_NODES)
    fail(`template exceeds ${MAX_EVALUATED_NODES} nodes`)
  if (depth > MAX_DEPTH)
    fail(`template exceeds ${MAX_DEPTH} levels of nesting`)
}

function propertyName(node: Node): string {
  if (node.type === 'Identifier')
    return node.name
  if (node.type === 'StringLiteral')
    return node.value
  if (node.type === 'NumericLiteral')
    return String(node.value)
  return fail(`object key type ${node.type}`)
}

function evaluateObject(node: Extract<Node, { type: 'ObjectExpression' }>, state: EvaluationState, depth: number) {
  const value: Record<string, unknown> = {}

  for (const property of node.properties) {
    if (property.type !== 'ObjectProperty' || property.computed || property.shorthand)
      fail('object spreads, methods, computed keys, and shorthand properties are not allowed')

    const key = propertyName(property.key)
    if (BlockedPropertyNames.has(key))
      fail(`object key ${key}`)

    value[key] = evaluateNode(property.value, state, depth + 1)
  }

  return value
}

function evaluateTemplateLiteral(node: Extract<Node, { type: 'TemplateLiteral' }>, state: EvaluationState, depth: number) {
  let value = ''
  for (let index = 0; index < node.quasis.length; index++) {
    value += node.quasis[index]?.value.cooked ?? node.quasis[index]?.value.raw ?? ''
    if (index < node.expressions.length)
      value += String(evaluateNode(node.expressions[index]!, state, depth + 1) ?? '')
  }
  return value
}

function evaluateLogical(node: Extract<Node, { type: 'LogicalExpression' }>, state: EvaluationState, depth: number) {
  const left = evaluateNode(node.left, state, depth + 1)
  if (node.operator === '&&')
    return left ? evaluateNode(node.right, state, depth + 1) : left
  if (node.operator === '||')
    return left || evaluateNode(node.right, state, depth + 1)
  return left ?? evaluateNode(node.right, state, depth + 1)
}

function evaluateUnary(node: Extract<Node, { type: 'UnaryExpression' }>, state: EvaluationState, depth: number) {
  const value = evaluateNode(node.argument, state, depth + 1)
  if (node.operator === '!')
    return !value
  if (node.operator === '+' && (typeof value === 'string' || typeof value === 'number'))
    return Number(value)
  if (node.operator === '-' && (typeof value === 'string' || typeof value === 'number'))
    return -Number(value)
  return fail(`unary operator ${node.operator}`)
}

function jsxText(value: string): string | null {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized || null
}

function evaluateJsxChild(node: Node, state: EvaluationState, depth: number): unknown {
  if (node.type === 'JSXText')
    return jsxText(node.value)
  if (node.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'JSXEmptyExpression')
      return null
    return evaluateNode(node.expression, state, depth + 1)
  }
  if (node.type === 'JSXElement' || node.type === 'JSXFragment')
    return evaluateNode(node, state, depth + 1)
  return fail(`JSX child type ${node.type}`)
}

function evaluateJsxElement(node: Extract<Node, { type: 'JSXElement' }>, state: EvaluationState, depth: number): OgImageJsxNode {
  const name = node.openingElement.name
  if (name.type !== 'JSXIdentifier' || !AllowedElements.has(name.name))
    fail('only standard OG layout elements are allowed')

  const props: Record<string, unknown> = {}
  for (const attribute of node.openingElement.attributes) {
    if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier')
      fail('spread and namespaced JSX attributes are not allowed')

    const key = attribute.name.name
    if (BlockedPropertyNames.has(key))
      fail(`attribute ${key}`)

    if (attribute.value === null) {
      props[key] = true
    }
    else if (attribute.value.type === 'StringLiteral') {
      props[key] = attribute.value.value
    }
    else if (attribute.value.type === 'JSXExpressionContainer' && attribute.value.expression.type !== 'JSXEmptyExpression') {
      props[key] = evaluateNode(attribute.value.expression, state, depth + 1)
    }
    else {
      fail(`attribute value for ${key}`)
    }
  }

  const children = node.children
    .map(child => evaluateJsxChild(child, state, depth + 1))
    .flat(Infinity)
    .filter(child => child !== null && child !== undefined && child !== false)

  if (children.length === 1)
    props.children = children[0]
  else if (children.length > 1)
    props.children = children

  return { type: name.name, props }
}

function evaluateJsxFragment(node: Extract<Node, { type: 'JSXFragment' }>, state: EvaluationState, depth: number): OgImageJsxNode {
  const children = node.children
    .map(child => evaluateJsxChild(child, state, depth + 1))
    .flat(Infinity)
    .filter(child => child !== null && child !== undefined && child !== false)

  return {
    type: 'symbol-fragment',
    props: { children: children.length === 1 ? children[0] : children },
  }
}

function evaluateNode(node: Node, state: EvaluationState, depth: number): unknown {
  visit(state, depth)

  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'Identifier':
      if (node.name === 'undefined')
        return undefined
      return fail(`identifier ${node.name}`)
    case 'ObjectExpression':
      return evaluateObject(node, state, depth)
    case 'ArrayExpression':
      return node.elements.map(element => element === null ? null : evaluateNode(element, state, depth + 1))
    case 'TemplateLiteral':
      return evaluateTemplateLiteral(node, state, depth)
    case 'ConditionalExpression':
      return evaluateNode(node.test, state, depth + 1)
        ? evaluateNode(node.consequent, state, depth + 1)
        : evaluateNode(node.alternate, state, depth + 1)
    case 'LogicalExpression':
      return evaluateLogical(node, state, depth)
    case 'UnaryExpression':
      return evaluateUnary(node, state, depth)
    case 'JSXElement':
      return evaluateJsxElement(node, state, depth)
    case 'JSXFragment':
      return evaluateJsxFragment(node, state, depth)
    case 'ParenthesizedExpression':
    case 'TSAsExpression':
    case 'TSTypeAssertion':
    case 'TSNonNullExpression':
    case 'TSSatisfiesExpression':
      return evaluateNode(node.expression, state, depth + 1)
    default:
      return fail(`expression type ${node.type}`)
  }
}

export function parseOgImageJsx(code: string): OgImageJsxNode {
  if (!code.trim())
    throw new Error('JSX template is empty')
  if (code.length > MAX_SOURCE_LENGTH)
    throw new Error(`JSX template exceeds ${MAX_SOURCE_LENGTH} characters`)

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
  const statements = ast.program.body.filter(statement => statement.type !== 'EmptyStatement')
  if (statements.length !== 1 || statements[0]?.type !== 'ExportDefaultDeclaration')
    fail('provide exactly one default-exported component')

  const component = statements[0].declaration
  if (component.type !== 'FunctionDeclaration'
    && component.type !== 'FunctionExpression'
    && component.type !== 'ArrowFunctionExpression') {
    fail('the default export must be a function')
  }
  if (component.params.length > 0 || component.async || component.generator)
    fail('the component must be a synchronous function without parameters')

  let returned: Node | null | undefined
  if (component.body.type === 'BlockStatement') {
    if (component.body.body.length !== 1 || component.body.body[0]?.type !== 'ReturnStatement')
      fail('the component body may only contain a return statement')
    returned = component.body.body[0].argument
  }
  else {
    returned = component.body
  }

  if (!returned || (returned.type !== 'JSXElement' && returned.type !== 'JSXFragment'))
    fail('the component must return JSX')

  return evaluateNode(returned, { evaluatedNodes: 0 }, 0) as OgImageJsxNode
}
