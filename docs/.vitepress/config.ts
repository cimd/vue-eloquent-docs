import {defineConfig} from 'vitepress'
import markdownItTaskLists from 'markdown-it-task-lists'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Eloquent",
  description: "Vue3 and Laravel API and Eloquent integration",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Intro', link: '/introduction' },
          { text: 'Roadmap', link: '/roadmap' },
        ]
      },
      {
        text: 'Laravel Package',
        items: [
          { text: 'Installation', link: '/laravel/installation' },
          { text: 'Model', link: '/laravel/model' },
          { text: 'Controller', link: '/laravel/controller' },
          { text: 'Examples', link: '/laravel/examples' },
        ]
      },
      {
        text: 'Vue Package',
        items: [
          { text: 'Installation', link: '/vue/installation' },
          { text: 'API Class', link: '/vue/api' },
          { text: 'Model', link: '/vue/model' },
          { text: 'Collection', link: '/vue/collection' },
          { text: 'Auth', link: '/vue/auth' },
          { text: 'Policy', link: '/vue/policy' },
          { text: 'Pinia Stores', link: '/vue/stores' },
          { text: 'DevTools', link: '/vue/devtools' },
          { text: 'Examples', link: '/vue/examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cimd/vue-eloquent' }
    ],
  },
  markdown: {
    config: (md) => {
      md.use(markdownItTaskLists)
    }
  }
})
