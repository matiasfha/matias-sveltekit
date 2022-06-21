import { join, basename, extname } from 'path'

export const defaults = {
  extensions: ['.svelte.md', '.md', '.svx'],
  dir: `$lib`,
  list: []
}

/**
 * Injects global imports in all your mdsvex files
 * Specify:
 * - the root dir (defaults to `src/lib`)
 * - the array list of components (with extension), like `['Component.svelte']`
 * - the valid extensions list as an array (defaults to `['.svelte.md', '.md', '.svx']`)
 *
 * If you want the component name to be different from the file name, you can specify an array
 * of arrays: `['Component.svelte', ['Another', 'AnotherComp.svelte'], 'ThirdComp.svelte']`
 *
 * @param {Object} options options described above
 * @returns a preprocessor suitable to plug into the `preprocess` key of the svelte config
 */
export const mdsvexGlobalComponents = (options = {}) => {
  const { extensions, dir, list } = { ...defaults, ...options }
  const extensionsRegex = new RegExp('(' + extensions.join('|').replace(/\./g, '\\.') + ')$', 'i')

  if (!list || !list.length || !Array.isArray(list)) {
    throw new Error(`"list" option must be an array and contain at least one element`)
  }

  const imports = list
    .map((entry) => {
      let name = ''
      if (Array.isArray(entry)) {
        name = entry[0]
        entry = entry[1]
      }
      const ext = extname(entry)
      const path = join(dir, entry)
      name = name || basename(entry, ext)
      return `\nimport ${name} from "${path}"`
    })
    .join('\n')

  const preprocessor = {
    script(thing) {
      const { content, filename, attributes, markup } = thing
      if (!filename.match(extensionsRegex)) {
        return { code: content }
      }
      const hasModuleContext = /^<script context="module">/.test(markup)
      const isModulePass = attributes?.context === 'module'
      const isValidPass = (hasModuleContext && isModulePass) || !hasModuleContext
      if (!isValidPass) {
        return { code: content }
      }
      return { code: `${imports}\n${content}` }
    }
  }
  return preprocessor
}