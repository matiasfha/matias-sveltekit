/**  @typedef {import('svelte/types/compiler/preprocess').PreprocessorGroup} PreprocessorGroup */

export const similarPostsLoader = () => {
  /**
   * @type PreprocessorGroup
   */
  const preprocessor = {
    /** @type {import('svelte/types/compiler/preprocess').Preprocessor} */
    script(thing) {
      const { content, filename, markup, attributes } = thing;
      if (!filename.match(/\.svx$/)) {
        return { code: content };
      }
      if (!filename.match(/\/blog\/.*\.svx$/)) {
        return { code: content };
      }
      const hasModuleContext = /^<script context="module">/.test(markup);
      const isModulePass = attributes?.context === "module";
      const isValidPass =
        (hasModuleContext && isModulePass) || !hasModuleContext;
      if (!isValidPass) {
        return { code: content };
      }
      
      return {
        code: `
                    import getSimilarPosts from "$api/getSimilarPosts"
                    /** @type {import('./__types/[slug]').Load} */
                    export async function load({fetch, url}) {
                          try {
                              const { pathname } = url
                              const similarPosts = await getSimilarPosts(pathname)
                              const mentions = await fetch('/blog/post/mentions.json?url='+url)
                              const { likes, retweet } = await mentions.json()
                              console.log({retweet}) 
                              return {
                                  props: {
                                      similarPosts,
                                      likes,
                                      retweet
                                  }
                              }			
                          }catch(e) {
                              console.error(e)
                              return {
                                  status: 500,
                                  error: e
                              }
                          }
                    }
                \n${content}
                `,
      };
    },
  };
  return preprocessor;
};
