// schemas/siteSettings.js
export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'], 
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text'
    },
    {
        name: 'keywords',
        title: 'Keywords',
        type: 'array',
        of: [{type: 'string'}]
    },
     {
        title: 'URL',
        name: 'url',
        type: 'url',
        description: 'The main site url.',
      },
      {
        title: 'Main navigation',
        name: 'mainNav',
        description: 'Select menu for main navigation',
        type: 'reference',
        to: {type: 'navigation'},
      },
  ]
}