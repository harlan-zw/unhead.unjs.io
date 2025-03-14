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

export function replaceImportSpecifier(
  payload: any,
  oldImport: string,
  newImport: string,
): void {
  walk(
    payload,
    node => Array.isArray(node) && node[0] === 'pre',
    (node) => {
      if (node[1].code) {
        // do a string replace of the "copy"
        node[1].code = node[1].code.replaceAll(oldImport, newImport)
      }
      let replaced = false
      if (!Array.isArray(node[2]))
        return

      // Process all lines directly from the original array
      for (let lineIndex = 2; lineIndex < node[2].length; lineIndex++) {
        const line = node[2][lineIndex]
        if (!Array.isArray(line))
          continue

        for (let i = 0; i < line.length; i++) {
          const segment = line[i]
          if (Array.isArray(segment) && segment[0] === 'span' && typeof segment[2] === 'string' && segment[2].includes(oldImport)) {
            // Replace the string directly in the segment
            segment[2] = segment[2].replace(oldImport, newImport)
            replaced = true
          }
        }
      }
    },
  )
}
