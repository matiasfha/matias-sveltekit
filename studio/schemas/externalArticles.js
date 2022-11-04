export default {
      title: 'External Articles',
      name:  'external-articles',
      type: 'document',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string'
        },
        {
          title: 'URL',
          name: 'url',
          type: 'string'
        },
        {
          title: 'Image',
          name: 'image',
          type: 'image'
        },
        {
          title: 'Published',
          name: 'published_at',
          type: 'datetime' 
        },
        {
          title: 'Tag',
          name: 'tag',
          type: 'string' 
        },
        { 
          title: 'Featured',
          name: 'featured',
          type: 'boolean'
        },
        {
          title: 'Description',
          name: 'description',
          type: 'text'
        },
        {
          title: 'Category',
          name: 'category',
          type: 'string'
        }
     
     ]
    }