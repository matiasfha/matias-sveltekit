export default {
    title: 'Egghead Courses',
    name: 'egghead-courses',
    type: 'document',
    fields: [
      {
        title: 'Featured',
        name: 'featured',
        type: 'boolean'
      },
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
          title: 'Description',
          name: 'description',
          type: 'text'
        },
        {
          title: 'Published at',
          name: 'published_at',
          type: 'date'
        },
        {
          title: 'Updated at',
          name: 'updated_at',
          type: 'date'
        },
        {
            title: 'Language',
            name: 'language',
            type: 'array',
            of: [{type: 'string'}],
            options: {
              list: [
                {title: 'English', value: 'en'},
                {title: 'Español', value: 'es'},
              ]
            }
          },
          {
            title: 'Type',
            name: 'type',
            type: 'array',
            of: [{type: 'string'}],
            options: {
              list: [
                {title: 'Free', value: 'free'},
                {title: 'Pro', value: 'pro'},
              ]
            }
          },
        {
          title: 'Category',
          name: 'category',
          type: 'string'
        }
    ]
}